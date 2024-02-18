object Form1: TForm1
  Left = 322
  Top = 335
  Width = 1088
  Height = 642
  Caption = 'Form1'
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = []
  OldCreateOrder = False
  DesignSize = (
    1072
    607)
  PixelsPerInch = 96
  TextHeight = 13
  object SoundMemo: TMemo
    Left = 0
    Top = 0
    Width = 1072
    Height = 577
    Align = alTop
    Anchors = [akLeft, akTop, akRight, akBottom]
    Lines.Strings = (
      '^120,*8,E6,A6,Fis6,*4,E6,A6,*8,P,D5,E5,D5,*4,Cis5,A4')
    TabOrder = 0
  end
  object PlayButton: TButton
    Left = 488
    Top = 580
    Width = 75
    Height = 25
    Anchors = [akLeft, akRight]
    Caption = 'Play'
    TabOrder = 1
    OnClick = PlayButtonClick
  end
end
