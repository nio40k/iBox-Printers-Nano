;(****Build and Slicing Parameters****)
;(Pix per mm X            = 3.20000 px/mm )
;(Pix per mm Y            = 3.20000 px/mm )
;(X Resolution            = 128 px )
;(Y Resolution            = 64 px )
;(X Pixel Offset          = 0 px )
;(Y Pixel Offset          = 0 px )
;(Layer Thickness         = 0.10000 mm )
;(Layer Time              = 14000 ms )
;(Bottom Layers Time        = 15000 ms )
;(Number of Bottom Layers = 3 )
;(Blanking Layer Time     = 8250 ms )
;(Build Direction         = Bottom_Up)
;(Lift Distance           = 5 mm )
;(Slide/Tilt Value        = 0)
;(Anti Aliasing           = True)
;(Use Mainlift GCode Tab  = False)
;(Anti Aliasing Value     = 1.5 )
;(Z Lift Feed Rate        = 50.00000 mm/s )
;(Z Lift Retract Rate     = 400.00000 mm/s )
;(Flip X                  = False)
;(Flip Y                  = False)
;Number of Slices        =  200
;(****Machine Configuration ******)
;(Platform X Size         = 40mm )
;(Platform Y Size         = 20mm )
;(Platform Z Size         = 90mm )
;(Max X Feedrate          = 100mm/s )
;(Max Y Feedrate          = 100mm/s )
;(Max Z Feedrate          = 100mm/s )
;(Machine Type            = UV_DLP)
;********** Header Start ********
;Here you can set any G or M-Code which should be executed BEFORE the build process
G21 ;Set units to be mm
G91 ;Relative Positioning
M17 ;Enable motors
;********** Header End **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 0 
;<Delay> 15000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 1 
;<Delay> 15000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 2 
;<Delay> 15000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 3 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 4 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 5 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 6 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 7 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 8 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 9 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 10 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 11 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 12 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 13 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 14 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 15 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 16 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 17 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 18 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 19 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 20 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 21 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 22 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 23 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 24 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 25 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 26 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 27 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 28 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 29 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 30 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 31 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 32 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 33 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 34 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 35 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 36 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 37 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 38 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 39 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 40 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 41 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 42 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 43 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 44 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 45 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 46 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 47 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 48 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 49 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 50 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 51 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 52 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 53 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 54 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 55 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 56 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 57 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 58 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 59 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 60 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 61 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 62 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 63 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 64 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 65 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 66 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 67 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 68 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 69 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 70 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 71 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 72 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 73 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 74 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 75 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 76 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 77 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 78 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 79 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 80 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 81 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 82 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 83 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 84 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 85 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 86 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 87 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 88 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 89 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 90 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 91 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 92 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 93 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 94 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 95 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 96 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 97 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 98 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 99 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 100 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 101 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 102 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 103 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 104 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 105 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 106 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 107 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 108 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 109 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 110 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 111 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 112 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 113 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 114 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 115 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 116 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 117 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 118 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 119 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 120 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 121 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 122 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 123 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 124 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 125 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 126 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 127 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 128 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 129 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 130 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 131 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 132 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 133 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 134 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 135 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 136 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 137 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 138 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 139 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 140 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 141 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 142 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 143 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 144 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 145 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 146 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 147 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 148 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 149 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 150 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 151 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 152 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 153 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 154 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 155 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 156 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 157 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 158 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 159 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 160 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 161 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 162 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 163 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 164 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 165 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 166 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 167 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 168 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 169 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 170 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 171 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 172 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 173 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 174 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 175 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 176 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 177 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 178 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 179 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 180 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 181 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 182 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 183 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 184 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 185 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 186 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 187 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 188 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 189 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 190 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 191 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 192 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 193 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 194 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 195 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 196 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 197 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 198 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Pre-Slice Start ********
;Set up any GCode here to be executed before a lift
;********** Pre-Slice End **********
;<Slice> 199 
;<Delay> 14000 
;<Slice> Blank 
;********** Lift Sequence ********
G1 Z5.0 F50.0
G1 Z-4.9 F400.0
;<Delay> 8250
;********** Lift Sequence **********
;********** Footer Start ********
;Here you can set any G or M-Code which should be executed after the last Layer is Printed
M18 ;Disable Motors
;<Completed>
;********** Footer End ********
