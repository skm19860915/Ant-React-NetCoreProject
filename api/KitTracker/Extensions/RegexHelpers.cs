using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace KitTracker.Extensions
{
    public static class RegexHelpers
    {
        public static string GetFirstPatternMatch(string input, string pattern)
        {
            if (string.IsNullOrEmpty(input))
                return null;

            Regex regex = new Regex(pattern, RegexOptions.IgnoreCase);

            Match m = regex.Match(input);
            if (m.Success)
                return m.Groups[1].Value;
            else
                return null;
        }

        public static bool ValidatePatternMatch(string input, string pattern)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            Regex regex = new Regex(pattern, RegexOptions.IgnoreCase);

            Match m = regex.Match(input);
            return m.Success;
        }
    }
}
