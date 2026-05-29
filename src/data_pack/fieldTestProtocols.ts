// static descriptive guidelines for field test protocols in Track.Lab.
// No database. No AI. No runtime advice.

export interface FieldTestProtocol {
  id: string;
  name: string;
  category: string;
  durationText: string;
  intensityLabel: string;
  instructions: string[];
  equipmentNeeded: string[];
  safetyNote: string;
}

export const fieldTestProtocols: FieldTestProtocol[] = [
  {
    id: "cooper_12min",
    name: "Cooper 12-Minute Run Test",
    category: "Aerobic Capacity",
    durationText: "12 minutes max effort",
    intensityLabel: "Maximal sustained effort (RPE 9-10)",
    instructions: [
      "Perform a thorough 10-minute warm-up including dynamic drills.",
      "Start a stopwatch and run as far as possible in 12 minutes on a flat surface or 400m track.",
      "Maintain a steady, maximal pace; avoid sprinting too early.",
      "At exactly 12 minutes, stop and record your total distance covered in meters."
    ],
    equipmentNeeded: ["Track or accurate GPS watch", "Stopwatch"],
    safetyNote: "This represents a severe cardiovascular stimulus. Ensure you are fully cleared for high-intensity exercise."
  },
  {
    id: "lthr_30min",
    name: "30-Minute LTHR Field Test",
    category: "Lactate Threshold",
    durationText: "30 minutes solo time-trial",
    intensityLabel: "Maximal steady state effort (RPE 8-9)",
    instructions: [
      "Complete a 10-15 minute warm-up with a few quick accelerations.",
      "Start a 30-minute hard run, paced as a solo time trial (as far as you can sustain for 30 minutes).",
      "At exactly 10 minutes into the run, press the LAP button on your HR monitor.",
      "Run at maximum intensity for the remaining 20 minutes.",
      "Record your average Heart Rate for the final 20 minutes of the test. This average is your estimated LTHR."
    ],
    equipmentNeeded: ["Heart Rate monitor (chest strap preferred)", "GPS watch / stopwatch"],
    safetyNote: "Adequate hydration is critical. Avoid testing in extreme heat or humidity."
  },
  {
    id: "threshold_20min",
    name: "Joe Friel 20-Minute Threshold Test",
    category: "Pacing & Threshold",
    durationText: "20 minutes max effort",
    intensityLabel: "Severe tempo time-trial (RPE 9)",
    instructions: [
      "Perform a 15-minute progressive warm-up with 3 × 30-second fast strides.",
      "Run flat-out for 20 minutes, aiming to cover the maximum possible distance.",
      "Record your average speed, pace, and average heart rate during this 20-minute block.",
      "Your functional threshold pace is typically estimated as 5% slower than your 20-minute average pace."
    ],
    equipmentNeeded: ["GPS watch", "Heart Rate chest strap (recommended)"],
    safetyNote: "Pacing is difficult. Slower initial minutes yield better total overall scores than starting too fast."
  },
  {
    id: "sweat_rate",
    name: "Functional Sweat Rate Protocol",
    category: "Fuel & Hydration",
    durationText: "1 to 2 hours of running",
    intensityLabel: "Target workout intensity (Z2 to Z4)",
    instructions: [
      "Empty your bladder completely and record your nude or semi-nude body weight (Pre-Weight) immediately before the run.",
      "Run for exactly 60 or 120 minutes. Keep track of all fluids consumed in Liters (Fluid Intake).",
      "Do not urinate or defecate during the run. (If you must, record urine output using a measuring cylinder if possible).",
      "Immediately after the run, towel dry completely and record your semi-nude body weight (Post-Weight) on the same scale."
    ],
    equipmentNeeded: ["High-precision digital luggage/body scale", "Graduated fluid bottle"],
    safetyNote: "If testing in heavy heat, do not deliberately restrict fluids. This test is descriptive, not of dehydration tolerance."
  },
  {
    id: "hr_recovery",
    name: "Heart Rate Recovery (HRR) Test",
    category: "HR Response Recovery",
    durationText: "2 minutes post-exercise",
    intensityLabel: "Maximal or near-maximal effort check",
    instructions: [
      "Complete a high-intensity interval segment or time trial to raise heart rate near peak levels.",
      "Record your absolute highest heart rate reached at completion of the effort (Peak HR).",
      "Immediately stop running. Stand perfectly still, or sit quietly. Do not warm down yet.",
      "Wait exactly 60 seconds and record your HR (1-Min HR).",
      "Optionally, wait another 60 seconds (at the 2-minute mark) and record HR (2-Min HR)."
    ],
    equipmentNeeded: ["Heart Rate monitor with high sampling frequency"],
    safetyNote: "Sudden complete cessation of severe exercise can induce blood pooling or lightheadedness. Lean on a railing if needed."
  },
  {
    id: "treadmill_calibration",
    name: "Treadmill Calibration Test",
    category: "Gear & Tools",
    durationText: "Determined by test distance",
    intensityLabel: "Steady calibrated speed",
    instructions: [
      "Set your treadmill to a flat (0-1%) grade at your typical running pace (e.g. 10.0 km/h).",
      "Run for a set distance target displayed on the treadmill console (e.g., 5.00 km).",
      "Using a calibrated external pod, stride sensor, or manually measuring belt revolutions (rev limit multiplier), determine the exact physical distance covered.",
      "Record both values to estimate console speed error percentage."
    ],
    equipmentNeeded: ["Treadmill", "Calibrated footpod or wheel measurement tool"],
    safetyNote: "Keep treadmill safety clip attached to your apparel at all times."
  }
];
