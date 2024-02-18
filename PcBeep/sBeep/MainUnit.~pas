unit MainUnit;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, PCSSound, StdCtrls;

type
  TForm1 = class(TForm)
    SoundMemo: TMemo;
    PlayButton: TButton;
    procedure PlayButtonClick(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

var
  Form1: TForm1;

implementation

{$R *.dfm}

procedure TForm1.PlayButtonClick(Sender: TObject);
begin
Form1.SoundMemo.Enabled:=false;
SoundThread:=TSoundThread.Create(false);
end;

end.
