IF OBJECT_ID('fk_Rollout_ID_Order', 'F') IS NOT NULL
BEGIN
    ALTER TABLE tOrder
    DROP CONSTRAINT fk_Rollout_ID_Order;
END

-- check if column exist
IF EXISTS (select column_name
               from INFORMATION_SCHEMA.columns
               where table_name = 'tOrder'
                     and column_name = 'OrderRolloutId')
BEGIN
    ALTER TABLE tOrder
    DROP COLUMN OrderRolloutId;
END

IF OBJECT_ID('[dbo].[OrderRollOut]', 'U') IS NOT NULL
DROP TABLE [dbo].[OrderRollOut]
GO
-- Create the table in the specified schema
CREATE TABLE [dbo].[OrderRollOut]
(
    [OrderRolloutId] INT NOT NULL PRIMARY KEY, -- Primary Key column
    [UploadedDateTime] DATETIME NOT NULL DEFAULT Getdate(),
    [Title] NVARCHAR(75) NOT NULL
);
GO

ALTER TABLE tOrder ADD OrderRolloutId INT NULL;
ALTER TABLE tOrder add CONSTRAINT fk_Rollout_ID_Order FOREIGN KEY (OrderRolloutId) REFERENCES OrderRollout(OrderRolloutId);

