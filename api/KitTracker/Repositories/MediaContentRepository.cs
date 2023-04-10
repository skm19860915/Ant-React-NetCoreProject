using Dapper;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Portal.OMC;
using KitTracker.Settings;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace KitTracker.Repositories
{
    public class MediaContentRepository
    {
		private readonly string _connectionString;
		public MediaContentRepository(IOptions<PortalSettings> settings)
		{
			_connectionString = settings.Value.ConnectionString;
		}

		public async Task<IEnumerable<tMediaContentStore>> GetMediaContents()
		{
            using (var conn = new SqlConnection(_connectionString))
            {
                try
                {
                    var stores = new Dictionary<int, tMediaContentStore>();
                    await conn.QueryAsync<
                        tMediaContentStore, tMediaContentRegion, tMediaContentDisplayType, tMediaContentRetailer, 
                        tMediaContentPlayer, tUploadedFile, tMediaContentStore>
                        (@"select s.*, r.*, d.*, re.*, p.*, f.* 
                        from tMediaContentStore s join tMediaContentRegion r on s.MediaContentRegionID = r.MediaContentRegionID 
                        join tMediaContentDisplayType d on s.MediaContentDisplayTypeID = d.MediaContentDisplayTypeID
                        join tMediaContentRetailer re on d.MediaContentRetailerID = re.MediaContentRetailerID
                        join tMediaContentPlayer p on s.MediaContentStoreID = p.MediaContentStoreID
                        join tUploadedFile f on p.ScreenshotFile_UploadedFileID = f.UploadedFileID",
                        (s, r, d, re, p, f) =>
                        {
                            tMediaContentStore store;
                            if (!stores.TryGetValue(s.MediaContentStoreId, out store))
                            {
                                store = s;
                                store.MediaContentRegion = r;
                                d.MediaContentRetailer = re;
                                store.MediaContentDisplayType = d;
                                store.Players = new List<tMediaContentPlayer>();
                                stores.Add(store.MediaContentStoreId, store);
                            }
                            p.UploadedFile = f;
                            store.Players.Add(p);
                            return store;
                        }, splitOn: "MediaContentRegionID, MediaContentDisplayTypeID, MediaContentRetailerID, MediaContentPlayerID, UploadedFileID");

                    var mediaContentStores = stores.Values;

                    var allScheduleLEDColors = await conn.QueryAsync<tMediaContentScheduleLEDColor, tMediaContentLEDColor, tMediaContentScheduleLEDColor>
                        (@"select sl.*, l.*
                        from tMediaContentScheduleLEDColor sl join tMediaContentLEDColor l on sl.MediaContentLEDColorID = l.MediaContentLEDColorID",
                        (sl, l) =>
                        {
                            tMediaContentScheduleLEDColor scheduleLEDColor;
                            sl.MediaContentLEDColor = l;
                            scheduleLEDColor = sl;

                            return scheduleLEDColor;
                        }, splitOn: "MediaContentLEDColorID");

                    var scheduleLEDColors = allScheduleLEDColors.Where(sl => sl.StartDateTime < DateTime.Now)
                                                .GroupBy(sl => sl.MediaContentStoreID, (key, g) =>
                                                g.OrderByDescending(lc => lc.StartDateTime)
                                                .OrderByDescending(lc => lc.MediaContentScheduleLEDColorID).FirstOrDefault());

                    foreach(var m in mediaContentStores)
                    {
                        var color = scheduleLEDColors.FirstOrDefault(x => x.MediaContentStoreID == m.MediaContentStoreId);
                        if(color == null)
                            continue;
                        m.LEDColor = color.MediaContentLEDColor.R + "," + color.MediaContentLEDColor.G + "," + color.MediaContentLEDColor.B;
                    }

                    return mediaContentStores;
                }
                catch
                {
                    return null;
                }
            }
        }
	}
}
