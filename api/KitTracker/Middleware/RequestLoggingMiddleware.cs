﻿using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IO;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;
    private readonly RecyclableMemoryStreamManager _recyclableMemoryStreamManager;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
        _recyclableMemoryStreamManager = new RecyclableMemoryStreamManager();
    }

    public async Task Invoke(HttpContext context)
    {
        await LogRequest(context);
        await LogResponse(context);
    }

    private async Task LogRequest(HttpContext context)
    {
        context.Request.EnableBuffering();
        await using var requestStream = _recyclableMemoryStreamManager.GetStream();
        await context.Request.Body.CopyToAsync(requestStream);
        _logger.LogInformation($"Http Request Information:{Environment.NewLine}" +
                               $"Schema:{context.Request.Scheme} " +
                               $"Host: {context.Request.Host} " +
                               $"Path: {context.Request.Path} " +
                               $"QueryString: {context.Request.QueryString}");
        context.Request.Body.Position = 0;
    }
    private static string ReadStreamInChunks(Stream stream)
    {
        const int readChunkBufferLength = 4096;
        stream.Seek(0, SeekOrigin.Begin);
        using var textWriter = new StringWriter();
        using var reader = new StreamReader(stream);
        var readChunk = new char[readChunkBufferLength];
        int readChunkLength;
        do
        {
            readChunkLength = reader.ReadBlock(readChunk,
                                               0,
                                               readChunkBufferLength);
            textWriter.Write(readChunk, 0, readChunkLength);
        } while (readChunkLength > 0);
        return textWriter.ToString();
    }

    private async Task LogResponse(HttpContext context)
    {
        var originalBodyStream = context.Response.Body;
        await using var responseBody = _recyclableMemoryStreamManager.GetStream();
        context.Response.Body = responseBody;
        await _next(context);
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var text = await new StreamReader(context.Response.Body).ReadToEndAsync();
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        _logger.LogInformation($"Http Response Information:{Environment.NewLine}" +
                               $"Schema:{context.Request.Scheme} " +
                               $"Host: {context.Request.Host} " +
                               $"Path: {context.Request.Path} " +
                               $"QueryString: {context.Request.QueryString}");
        await responseBody.CopyToAsync(originalBodyStream);
    }
}