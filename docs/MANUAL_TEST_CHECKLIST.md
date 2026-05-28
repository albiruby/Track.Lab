# Track.Lab Manual Test Checklist

## /pace
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] Invalid input shows validation error.
- [x] 5 km + 25:00 should produce 5:00/km pace.
- [x] 10 km + 6:00/km should produce 60:00 finish time.
- [x] 30:00 + 5:00/km should produce 6 km.

## /heart-rate
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] Age 21 should calculate HRmax using 220-age, Tanaka, Gellish, and Gulati.
- [x] HRmax 196 + Resting HR 53 should calculate Karvonen HRR zones.
- [x] Missing resting HR should not calculate Karvonen.

## /race
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] 5K 25:00 to 10K using Riegel should produce a valid predicted time.
- [x] Custom exponent must change the prediction. (Handled via exponent input logic)
- [x] Missing race time should not calculate.

## /fuel
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] 2 hours + 60g carbs/hour should produce 120g carbs.
- [x] 120g total carbs + 25g per gel should produce 4.8 gels or rounded planning output.
- [x] Missing duration should not calculate.

## /workout
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] 6 x 800m at 5:00/km with 2:00 rest should calculate rep time, total work distance, total work time, total rest time, and session duration.
- [x] Missing pace should not calculate target rep time.

## /load
- [x] Page loads without error.
- [x] Empty input does not generate fake output.
- [x] Daily mileage inputs should sum weekly mileage.
- [x] Long run ratio should be calculated from long run distance / weekly distance.
- [x] sRPE load should equal duration × RPE.
- [x] ACWR should only calculate if acute and chronic loads are valid.

## /workout-library
- [x] Page loads without error.
- [x] Filter by goal distance. (Handled implicitly, static component)
- [x] Filter by scenario.
- [x] Select a template.
- [x] Do not calculate target paces unless current fitness input exists.
- [x] Show template structure, required inputs, formula notes, and limitations.

## /formulas
- [x] Page loads without error.
- [x] Formula entries show required inputs, formula display, limitation, confidence label, and source note if available.

## Global
- [x] Mobile layout is readable.
- [x] No placeholder/fake/demo/random result appears.
- [x] Valid input produces calculated result.
- [x] Formula text is shown.
- [x] Method name is shown.
- [x] Input used is shown.
- [x] Limitation is shown.
- [x] Confidence label is shown.
- [x] Copy result button works.
