ALTER TRIGGER [hill].[tr_WorkOrderHistorian]
   ON  [hill].[WorkOrder]
   AFTER INSERT, UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

    insert into hill.WorkOrderHistorian
			([WorkOrderId]
		   ,[HWONumber]
           ,[ItemNumber]
           ,[BulkPartNumber]
           ,[BulkPartName]
           ,[ExpectedQuantity]
           ,[MethodId]
           ,[MaterialSizeId]
           ,[LabelCSVExported]
           ,[Complete]
		   ,[CountryOfOrigin])
		select 
		[WorkOrderId]
		,[HWONumber]
           ,[ItemNumber]
           ,[BulkPartNumber]
           ,[BulkPartName]
           ,[ExpectedQuantity]
           ,[MethodId]
           ,[MaterialSizeId]
           ,[LabelCSVExported]
           ,[Complete]
		   ,[CountryOfOrigin]
		from INSERTED
END
GO

alter table hill.WorkOrderHistorian drop column PGAWONumber