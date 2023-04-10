using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using KitTracker.CustomProvider;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Portal.OMC;
using KitTracker.Settings;
using Microsoft.Extensions.Options;

namespace KitTracker.Repositories
{
    public class UsersRepository
    {
        private readonly string _portalConnectionString;

        public UsersRepository(IOptionsSnapshot<PortalSettings> portalSettings)
        {
            _portalConnectionString = portalSettings.Value.ConnectionString;
        }

        public async Task<ApplicationUser> FindByNameAsync(string userName)
        {
            using (IDbConnection conn = new SqlConnection(_portalConnectionString))
            {
                string sql = @"
SELECT *
FROM dbo.[AspNetUsers]
WHERE UserName = @UserName;
";
                return await conn.QuerySingleOrDefaultAsync<ApplicationUser>(sql, new
                {
                    UserName = userName
                });
            }
        }
        public async Task<List<string>> GetRolesAsync(ApplicationUser user)
        {
            using (IDbConnection conn = new SqlConnection(_portalConnectionString))
            {
                string sql = @"
SELECT allRoles.Name
FROM [dbo].[AspNetUserRoles] AS userRoles
JOIN [dbo].[AspNetRoles] AS allRoles ON userRoles.RoleId = allRoles.Id
WHERE userRoles.UserId = @UserId
";
                return (await conn.QueryAsync<string>(sql, new { UserId = user.Id })).ToList();
            }
        }

        public async Task<tUser> GetUser(ApplicationUser appUser)
        {
            using (IDbConnection conn = new SqlConnection(_portalConnectionString))
            {
                string sql = @"
SELECT * from tUser
WHERE AspNetUsers_Id = @AspnetUsers_Id
";
                return await conn.QuerySingleOrDefaultAsync<tUser>(sql, new { AspNetUsers_Id = appUser.Id });
            }
        }

        public async Task<IEnumerable<tPermissionMediaContentUserRetailer>> GetMediaContentRetailerPermissions(tUser user)
		{
            using (IDbConnection conn = new SqlConnection(_portalConnectionString))
            {
                string sql = @"
SELECT * from tPermissionMediaContentUserRetailer
WHERE UserId = @UserId
";
                return await conn.QueryAsync<tPermissionMediaContentUserRetailer>(sql, new { user.UserId });
            }
        }
    }
}
