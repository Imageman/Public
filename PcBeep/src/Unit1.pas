unit Unit1;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, MainBeep, Vcl.Buttons, Vcl.ExtCtrls, Vcl.StdCtrls;

type
  TForm1 = class(TForm)
    SpeedButton1: TSpeedButton;
    Memo1: TMemo;
    Timer1: TTimer;
    SpeedButton2: TSpeedButton;
    LinkLabel1: TLinkLabel;
    procedure SpeedButton1Click(Sender: TObject);
    procedure Timer1Timer(Sender: TObject);
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure SpeedButton2Click(Sender: TObject);
    procedure FormCreate(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
    PlayStr: ansistring;
    PlayPos: integer;
    AutoExit:boolean;
  end;

var
  Form1: TForm1;

implementation

{$R *.dfm}

procedure TForm1.FormClose(Sender: TObject; var Action: TCloseAction);
begin
  Timer1.Enabled := False;
end;

procedure TForm1.FormCreate(Sender: TObject);
var
  I: Integer;
begin
   AutoExit:=False;
   if ParamCount>0 then
   begin
     Memo1.Lines.Clear;
      for I := 1 to ParamCount do
           Memo1.Lines.Add(ParamStr(i));
      Form1.WindowState:=wsMinimized;
      SpeedButton1Click(Sender);
      AutoExit:=True;
   end;

end;

procedure TForm1.SpeedButton1Click(Sender: TObject);
begin
  PlayStr := Memo1.Lines.Text;
  PlayPos := 1;
  ResetTone;
  Timer1.Interval := ToneDelay + PauseDelay;
  Timer1.Enabled := True;
  // Beep(1246,1000);
end;

procedure TForm1.SpeedButton2Click(Sender: TObject);
var
  I: integer;
  s: ansistring;
begin
  s := '';
  Randomize;
  for I := 0 to 15 do
  begin
    if Random(10) = 0 then
    begin
      if Random(2) = 0 then
        s := s + '^'
      else
        s := s + '_';
      Continue;
    end;
    if Random(10) = 0 then
    begin
      if Random(2) = 0 then
        s := s + '+'
      else
        s := s + '-';
      Continue;
    end;
    if Random(10) = 0 then
    begin
      s := s + chr(Random(10) + ord('0'));
      Continue;
    end;
    s := s + chr(Random(23) + ord('A'));
  end;
  Memo1.Lines.Clear;
  Memo1.Lines.Add(s);
  SpeedButton1Click(Sender);
end;

procedure TForm1.Timer1Timer(Sender: TObject);
var
  currSym: AnsiChar;
  TmpTotal, I: integer;
  tone: Real;
  NrNota: integer;
begin
  while True do
  begin
    if PlayPos > Length(PlayStr) then
    begin
      ResetTone;
      if AutoExit then
        Halt(0);
      Exit;
    end;
    currSym := UpCase(PlayStr[PlayPos]);
    Inc(PlayPos);
    case currSym of
      '0' .. '9':
        begin // изменение соотношения нота-пауза
          TmpTotal := ToneDelay + PauseDelay;
          ToneDelay := round(TmpTotal * (10 - StrToInt(currSym)) / 10);
          PauseDelay := TmpTotal - ToneDelay;
        end;
      '^':
        begin // повышение тона
          MainTone := MainTone * 2;
          if MainTone < 20 then
            MainTone := 20;
        end;
      '_':
        begin // понижение тона
          MainTone := MainTone div 2;
          if MainTone > 15000 then
            MainTone := 15000;
        end;
      '+':
        begin // ускорение
          ToneDelay := round(ToneDelay * 0.8);
          PauseDelay := round(PauseDelay * 0.8);
          TmpTotal := ToneDelay + PauseDelay;
          Timer1.Interval := TmpTotal;
        end;
      '-':
        begin // замедление
          ToneDelay := round(ToneDelay / 0.8);
          PauseDelay := round(PauseDelay / 0.8);
          TmpTotal := ToneDelay + PauseDelay;
          Timer1.Interval := TmpTotal;
        end;
      'A' .. 'Z':
        begin
          NrNota := ord(currSym) - ord('A');
          tone := MainTone;
          for I := 0 to NrNota do
            tone := tone * 1.06;
          Beep(Trunc(tone), ToneDelay);
          Exit;
        end;
    end;
  end;
end;

end.
