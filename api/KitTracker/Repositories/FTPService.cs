using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KitTracker.Repositories
{
    public class FTPService
    {
        private readonly ILogger<FTPService> _logger;
        private readonly PortalSettings _settings;

        public FTPService(ILogger<FTPService> logger,
            IOptionsSnapshot<PortalSettings> settings)
        {
            _logger = logger;
            _settings = settings.Value;
        }

        public byte[] DownloadFile(string path)
        {
            using (WebClient request = new WebClient())
            {
                string url = "ftp://" + _settings.FTPUrl + "/" + path;
                request.Credentials = new NetworkCredential(_settings.FTPUsername, _settings.FTPPassword);

                return request.DownloadData(url);
            }
        }

        public void UploadFile(string path, byte[] binary)
        {
            using (WebClient request = new WebClient())
            {
                string url = "ftp://" + _settings.FTPUrl + "/" + path;
                request.Credentials = new NetworkCredential(_settings.FTPUsername, _settings.FTPPassword);

                request.UploadData(url, binary);
            }
        }
    }
}