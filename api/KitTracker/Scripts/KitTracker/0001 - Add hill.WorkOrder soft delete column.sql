alter table hill.WorkOrder
        ADD Archived Bit not null
 CONSTRAINT D_WorkOrder_Archived
    DEFAULT (0)
WITH VALUES