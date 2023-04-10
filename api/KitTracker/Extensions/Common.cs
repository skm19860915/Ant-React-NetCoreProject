using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace KitTracker.Extensions
{
    public static class Common
    {
        public static string GetDatabaseIDString(this int intValue)
        {
            return intValue.ToString().PadLeft(10, '0');
        }

        public static string NewLine2BRTag(this string text)
        {
            StringBuilder builder = new StringBuilder();
            string[] lines = text.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                if (i > 0)
                    builder.Append("<br/>\n");
                builder.Append(HttpUtility.HtmlEncode(lines[i]));
            }

            return builder.ToString();
        }

        public static string ToHexString(this byte[] bytes)
        {
            char[] hexArray = "0123456789ABCDEF".ToArray();
            char[] hexChars = new char[bytes.Length * 2];
            for (int j = 0; j < bytes.Length; j++)
            {
                int v = bytes[j] & 0xFF;
                hexChars[j * 2] = hexArray[(int)(((uint)v) >> 4)];
                hexChars[j * 2 + 1] = hexArray[v & 0x0F];
            }
            return new string(hexChars);
        }
    }
}
