unit MainBeep;

interface

uses System.SysUtils, windows;

type
  TIntProc = procedure(i: Integer); stdcall;
  TIntFunc = function(i: Integer): Integer; stdcall;
  TInt2Proc = procedure(i1, i2: Integer); stdcall;

var
  InputPort: TIntFunc;
  OutputPort: TInt2Proc;

  MainTone: Integer; // базовая нота Hz
  ToneDelay, PauseDelay: Integer; // длительность ноты и длительность паузы

procedure Beep(const Tone, Time: Integer);
procedure ResetTone;

implementation

procedure Beep(const Tone, Time: Integer);
var
  v, div1: Integer;
begin
  div1 := 1193180 div Tone;

  OutputPort($43, 182);

  OutputPort($42, div1 and $FF);
  OutputPort($42, (div1 shr 8) and $FF);

  v := InputPort($61);
  OutputPort($61, v or $03);

  Sleep(Time);

  v := InputPort($61);
  OutputPort($61, v and $FC);
end;

var
  ioDLLInstance: THandle;

procedure InitDLL;
begin
{$IFDEF WIN32}
  ioDLLInstance := LoadLibrary('inpout32');
{$ENDIF}
{$IFDEF WIN64}
  ioDLLInstance := LoadLibrary('inpoutx64.dll');
{$ENDIF}
  if ioDLLInstance >= 32 then { if <=32 - error ! }
  begin
    @InputPort := GetProcAddress(ioDLLInstance, 'Inp32');
    @OutputPort := GetProcAddress(ioDLLInstance, 'Out32');
    if @InputPort = nil then
      Exception.Create('Error import Inp32 pocedure');
    // MessageBoxW(ioDLLInstance, 'Error import Inp32 pocedure', '',    MB_OK + MB_ICONSTOP + MB_TOPMOST);

  end
  else
    Exception.Create('Error import inpout32/inpout64 dll');
  // MessageBoxW(ioDLLInstance, 'Error import inpout32/inpout64 dll', '',    MB_OK + MB_ICONSTOP + MB_TOPMOST);
end;

procedure ResetTone;
begin
MainTone:=220;
ToneDelay:=200;
PauseDelay:=50;

end;

initialization

InitDLL;
ResetTone;

finalization

if ioDLLInstance <= 32 then
  FreeLibrary(ioDLLInstance)

end.
