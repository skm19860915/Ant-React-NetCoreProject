CREATE TABLE [dbo].[tMediaContentPlayerLog](
	[MediaContentPlayerLogId] [int] IDENTITY(1,1) NOT NULL,
	[MediaContentPlayerId] [int] NOT NULL,
	[LogMessage] [text] NOT NULL,
	[Timestamp] [datetime] NOT NULL,
 CONSTRAINT [PK_tMediaContentPlayerLog] PRIMARY KEY CLUSTERED 
(
	[MediaContentPlayerLogId] ASC
)
)
GO

ALTER TABLE [dbo].[tMediaContentPlayerLog] ADD  CONSTRAINT [DF_tMediaContentPlayerLog_Timestamp]  DEFAULT (getdate()) FOR [Timestamp]
GO

ALTER TABLE [dbo].[tMediaContentPlayerLog]  WITH CHECK ADD  CONSTRAINT [FK_tMediaContentPlayerLog_tMediaContentPlayer] FOREIGN KEY([MediaContentPlayerId])
REFERENCES [dbo].[tMediaContentPlayer] ([MediaContentPlayerID])
GO

ALTER TABLE [dbo].[tMediaContentPlayerLog] CHECK CONSTRAINT [FK_tMediaContentPlayerLog_tMediaContentPlayer]
GO
