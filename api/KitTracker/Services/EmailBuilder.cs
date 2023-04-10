using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Services
{
    public interface IEmailComponent
    {
        public string GetHTML();
    }

    public class EmailHeader : IEmailComponent
    {
        public string GetHTML()
        {
            return "<a href='http://portal.petergaietto.com/' target='_blank'><img src='http://portal.petergaietto.com/img/logo.png' alt='PG&A Customer Portal' style='margin-bottom:10px' border='0' height='72'></a>";
        }
    }

    public class EmailParagraph : IEmailComponent
    {
        public string InnerHTML { get; set; }
        public EmailParagraph(string innerHTML)
        {
            InnerHTML = innerHTML;
        }
        public string GetHTML()
        {
            return "<p>" + InnerHTML + "</p>";
        }
    }

    public class EmailHeading : IEmailComponent
    {
        public int HeadingNumber { get; set; }
        public string InnerHTML { get; set; }
        public EmailHeading(int headingNumber, string innerHTML)
        {
            HeadingNumber = headingNumber;
            InnerHTML = innerHTML;
        }
        public string GetHTML()
        {
            return "<h" + HeadingNumber + " style='border-bottom:2px solid #eee;font-size:1.05em;padding-bottom:1px'>" + InnerHTML + "</h" + HeadingNumber + ">";
        }
    }

    public class EmailTableColumnHeaders : IEmailComponent
    {
        public int WidthPercent { get; set; } = -1;
        public string[] ColumnHeaders { get; set; }

        public EmailTableColumnHeaders(params string[] columnHeaders)
        {
            ColumnHeaders = columnHeaders;
        }
        public EmailTableColumnHeaders(int widthPercent, params string[] columnHeaders)
        {
            WidthPercent = widthPercent;
            ColumnHeaders = columnHeaders;
        }
        public string GetHTML()
        {
            string html = "<thead></tr>";

            foreach (string columnHeader in ColumnHeaders)
                html += "<th style='padding:5px 9px 6px 9px'" + (WidthPercent < 0 ? "" : " width='" + WidthPercent + "%'") + " bgcolor='#d9e5ee' align='left'>"
                    + columnHeader
                    + "</th>";

            html += "</tr></thead>";

            return html;
        }
    }

    public class EmailTableRow : IEmailComponent
    {
        public bool AltBGColor { get; set; }
        public string[] Cells { get; set; }

        public EmailTableRow(params string[] cells)
        {
            Cells = cells;
        }
        public string GetHTML()
        {
            string html = "<tr" + (AltBGColor ? " bgcolor='#f8f7f5'" : " bgcolor='#eeeded'") + ">";

            foreach (string cell in Cells)
                html += "<td style='padding:3px 9px' valign='top'>"
                    + cell
                    + "</td>";

            html += "</tr>";

            return html;
        }
    }

    public class EmailTable : IEmailComponent
    {
        public int WidthPercent { get; set; } = -1;
        public EmailTableColumnHeaders ColumnHeaders { get; set; }
        public EmailTableRow[] Rows { get; set; }

        public EmailTable(int widthPercent, params EmailTableRow[] rows)
        {
            WidthPercent = widthPercent;
            ColumnHeaders = null;
            Rows = rows;
        }

        public EmailTable(int widthPercent, EmailTableColumnHeaders columnHeaders, params EmailTableRow[] rows)
        {
            WidthPercent = widthPercent;
            ColumnHeaders = columnHeaders;
            Rows = rows;
        }

        public string GetHTML()
        {
            string html = "<table style='border:1px solid #bebcb7;background:#f8f7f5' cellspacing='0' cellpadding='0' border='0' " + (WidthPercent < 0 ? "" : " width='" + WidthPercent + "%'") + ">";

            if (ColumnHeaders != null)
                html += ColumnHeaders.GetHTML();

            html += "<tbody>";

            bool altBgColor = false;
            foreach (var row in Rows)
            {
                altBgColor = !altBgColor;
                row.AltBGColor = altBgColor;
                html += row.GetHTML();
            }

            html += "</tbody>";

            html += "</table>";

            return html;
        }
    }

    public class EmailNewline : IEmailComponent
    {
        public string GetHTML()
        {
            return "<br/>";
        }
    }

    public class EmailBuilder
    {
        public static string GetEmailHTML(params IEmailComponent[] parts)
        {
            string html = "<!DOCTYPE html><head></head><body><div style='margin: auto; padding: 10px; font: 14px Verdana,Arial,Helvetica,sans-serif; width: 90%'>";

            foreach (var part in parts)
                html += part.GetHTML();

            html += "</div></body></html>";

            return html;
        }

        public static string GetSubjectRequestIDSuffix()
        {
            Random rand = new Random();
            return " [Request ID: " + rand.Next(111111111, 999999999).ToString() + "]";
        }
    }
}
