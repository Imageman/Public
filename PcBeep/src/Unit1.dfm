object Form1: TForm1
  Left = 0
  Top = 0
  Caption = 'PC speaker player'
  ClientHeight = 286
  ClientWidth = 427
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  Position = poMainFormCenter
  OnClose = FormClose
  OnCreate = FormCreate
  DesignSize = (
    427
    286)
  PixelsPerInch = 96
  TextHeight = 13
  object SpeedButton1: TSpeedButton
    Left = 16
    Top = 228
    Width = 169
    Height = 50
    Anchors = [akLeft, akBottom]
    Caption = 'Play'
    OnClick = SpeedButton1Click
  end
  object SpeedButton2: TSpeedButton
    Left = 280
    Top = 228
    Width = 81
    Height = 50
    Anchors = [akRight, akBottom]
    Caption = 'RND sound'
    OnClick = SpeedButton2Click
  end
  object LinkLabel1: TLinkLabel
    Left = 16
    Top = 199
    Width = 403
    Height = 23
    Hint = 'lit999.narod.ru'
    Alignment = taRightJustify
    Anchors = [akLeft, akRight, akBottom]
    AutoSize = False
    Caption = 'made by imageman72@gmail.com'
    Font.Charset = DEFAULT_CHARSET
    Font.Color = clGray
    Font.Height = -11
    Font.Name = 'Tahoma'
    Font.Style = []
    ParentFont = False
    ParentShowHint = False
    ShowHint = True
    TabOrder = 1
  end
  object Memo1: TMemo
    Left = 16
    Top = 8
    Width = 402
    Height = 185
    Anchors = [akLeft, akTop, akRight, akBottom]
    Lines.Strings = (
      '1 //'#1076#1083#1080#1090#1077#1083#1100#1085#1086#1089#1090#1100' '#1087#1072#1091#1079#1099' '#1084#1072#1083#1077#1085#1100#1082#1072#1103
      '++ // '#1091#1074#1077#1083#1080#1095#1080#1083#1080' '#1089#1082#1086#1088#1086#1089#1090#1100
      #1087#1088#1086#1080#1075#1088#1072#1083#1080' '#1085#1086#1090#1099' ADADDOK'
      '^^ '#1087#1086#1074#1099#1089#1080#1083#1080' '#1090#1086#1085
      #1087#1088#1086#1080#1075#1088#1072#1083#1080' '#1085#1086#1090#1099' ADADDOK'
      '____ '#1087#1086#1085#1080#1079#1080#1083#1080' '#1090#1086#1085
      #1087#1088#1086#1080#1075#1088#1072#1083#1080' '#1085#1086#1090#1099' ADADDOK')
    TabOrder = 0
  end
  object Timer1: TTimer
    Enabled = False
    OnTimer = Timer1Timer
    Left = 384
    Top = 16
  end
end
