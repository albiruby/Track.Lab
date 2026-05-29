export function formatMinutesToTime(totalMins: number): string {
  let mins = Math.round(totalMins) % (24 * 60);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseRaceTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function calculateTimelineEventTime(raceStartTime: string, offsetMinutes: number): string {
  const startMins = parseRaceTimeToMinutes(raceStartTime);
  if (startMins === null) return raceStartTime;
  return formatMinutesToTime(startMins - offsetMinutes);
}

export function calculateWakeUpTime(raceStartTime: string, wakeOffsetMinutes: number): string {
  return calculateTimelineEventTime(raceStartTime, wakeOffsetMinutes);
}

export function calculateWarmupStartTime(raceStartTime: string, warmupOffsetMinutes: number): string {
  return calculateTimelineEventTime(raceStartTime, warmupOffsetMinutes);
}

export function calculateMealTiming(raceStartTime: string, mealOffsetMinutes: number): string {
  return calculateTimelineEventTime(raceStartTime, mealOffsetMinutes);
}

export function calculateHydrationTiming(raceStartTime: string, hydrationOffsetMinutes: number): string {
  return calculateTimelineEventTime(raceStartTime, hydrationOffsetMinutes);
}

export function calculateCaffeineTiming(raceStartTime: string, caffeineOffsetMinutes: number): string {
  return calculateTimelineEventTime(raceStartTime, caffeineOffsetMinutes);
}

export function calculateGelTiming(raceDurationMinutes: number, gelIntervalMinutes: number): number[] {
  if (isNaN(raceDurationMinutes) || isNaN(gelIntervalMinutes) || gelIntervalMinutes <= 0 || raceDurationMinutes <= 0) return [];
  const markers: number[] = [];
  for (let m = gelIntervalMinutes; m < raceDurationMinutes; m += gelIntervalMinutes) {
    markers.push(m);
  }
  return markers;
}

export function calculateFluidTiming(raceDurationMinutes: number, fluidIntervalMinutes: number): number[] {
  if (isNaN(raceDurationMinutes) || isNaN(fluidIntervalMinutes) || fluidIntervalMinutes <= 0 || raceDurationMinutes <= 0) return [];
  const markers: number[] = [];
  for (let m = fluidIntervalMinutes; m < raceDurationMinutes; m += fluidIntervalMinutes) {
    markers.push(m);
  }
  return markers;
}

export function calculateSodiumTiming(raceDurationMinutes: number, sodiumIntervalMinutes: number): number[] {
  if (isNaN(raceDurationMinutes) || isNaN(sodiumIntervalMinutes) || sodiumIntervalMinutes <= 0 || raceDurationMinutes <= 0) return [];
  const markers: number[] = [];
  for (let m = sodiumIntervalMinutes; m < raceDurationMinutes; m += sodiumIntervalMinutes) {
    markers.push(m);
  }
  return markers;
}

export function calculateAidStationPlan(raceDistanceKm: number, aidStationIntervalKm: number): number[] {
  if (isNaN(raceDistanceKm) || isNaN(aidStationIntervalKm) || aidStationIntervalKm <= 0 || raceDistanceKm <= 0) return [];
  const markers: number[] = [];
  for (let d = aidStationIntervalKm; d < raceDistanceKm; d += aidStationIntervalKm) {
    markers.push(parseFloat(d.toFixed(1)));
  }
  return markers;
}

export interface SplitItem {
  segment: number;
  distanceLabel: string;
  splitTimeSecs: number;
  cumulativeTimeSecs: number;
}

export function calculateRaceSplitCard(distanceKm: number, targetTimeSeconds: number, segmentKm: number): SplitItem[] {
  if (isNaN(distanceKm) || isNaN(targetTimeSeconds) || isNaN(segmentKm) || distanceKm <= 0 || targetTimeSeconds <= 0 || segmentKm <= 0) return [];
  
  const splits: SplitItem[] = [];
  const pacePerKm = targetTimeSeconds / distanceKm;
  let accumulatedDist = 0;
  let segmentNum = 1;

  while (accumulatedDist < distanceKm) {
    const nextDist = Math.min(distanceKm, accumulatedDist + segmentKm);
    const splitDist = nextDist - accumulatedDist;
    const splitTime = splitDist * pacePerKm;
    const finalCumTime = nextDist * pacePerKm;

    splits.push({
      segment: segmentNum,
      distanceLabel: `${nextDist.toFixed(1)} km`,
      splitTimeSecs: Math.round(splitTime),
      cumulativeTimeSecs: Math.round(finalCumTime)
    });

    accumulatedDist = nextDist;
    segmentNum++;
  }

  return splits;
}

export interface GoalItem {
  label: string;
  targetTimeSecs: number;
  averagePaceSecsPerKm: number;
  averageSpeedKmh: number;
  description: string;
}

export function calculateABCRaceGoalTable(
  baseTimeSeconds: number,
  conservativePercent: number,
  aggressivePercent: number,
  distanceKm: number
): GoalItem[] {
  if (isNaN(baseTimeSeconds) || isNaN(conservativePercent) || isNaN(aggressivePercent) || baseTimeSeconds <= 0 || distanceKm <= 0) return [];

  const aTimeSecs = baseTimeSeconds * (1 - aggressivePercent / 100);
  const bTimeSecs = baseTimeSeconds;
  const cTimeSecs = baseTimeSeconds * (1 + conservativePercent / 100);

  const getPace = (secs: number) => secs / distanceKm;
  const getSpeed = (secs: number) => (distanceKm / (secs / 3600));

  return [
    {
      label: "A Goal (Aggressive)",
      targetTimeSecs: Math.round(aTimeSecs),
      averagePaceSecsPerKm: getPace(aTimeSecs),
      averageSpeedKmh: getSpeed(aTimeSecs),
      description: `Optimistic target based on ideal race circumstances (-${aggressivePercent}% time adjustment).`
    },
    {
      label: "B Goal (Realistic / Target)",
      targetTimeSecs: Math.round(bTimeSecs),
      averagePaceSecsPerKm: getPace(bTimeSecs),
      averageSpeedKmh: getSpeed(bTimeSecs),
      description: "Primary deterministic target modeled from race predictors and current workouts."
    },
    {
      label: "C Goal (Conservative / Backup)",
      targetTimeSecs: Math.round(cTimeSecs),
      averagePaceSecsPerKm: getPace(cTimeSecs),
      averageSpeedKmh: getSpeed(cTimeSecs),
      description: `Secondary contingency fallback plan if weather, terrain, or muscular issues impact pacing (+${conservativePercent}% time adjustment).`
    }
  ];
}

export function calculateLastKilometerTarget(targetPaceSecsPerKm: number, pushPercent: number): number {
  if (isNaN(targetPaceSecsPerKm) || isNaN(pushPercent)) return targetPaceSecsPerKm;
  return targetPaceSecsPerKm * (1 - pushPercent / 100);
}

export interface TimelineEvent {
  time: string;
  timeOffsetMins: number; // positive is before start, negative is during/after
  title: string;
  detail: string;
}

export function generateRaceDayTimeline(inputs: {
  raceStartTime: string;
  wakeOffsetMins: number;
  mealOffsetMins: number;
  hydrationOffsetMins: number;
  caffeineOffsetMins?: number;
  warmupOffsetMins: number;
  raceDurationMins: number;
  gelIntervalMins?: number;
  fluidIntervalMins?: number;
  sodiumIntervalMins?: number;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const startMins = parseRaceTimeToMinutes(inputs.raceStartTime);
  if (startMins === null) return [];

  // Wake up
  events.push({
    time: formatMinutesToTime(startMins - inputs.wakeOffsetMins),
    timeOffsetMins: inputs.wakeOffsetMins,
    title: "Wake-Up & Initial Check",
    detail: "Awaken, perform manual recovery check (RHR/physical tightness check)."
  });

  // Pre-race meal
  events.push({
    time: formatMinutesToTime(startMins - inputs.mealOffsetMins),
    timeOffsetMins: inputs.mealOffsetMins,
    title: "Pre-Race Carbohydrate Meal",
    detail: "Consume easily digestible low-fiber carbohydrates to top off glycogen stores."
  });

  // Pre-race hydration
  events.push({
    time: formatMinutesToTime(startMins - inputs.hydrationOffsetMins),
    timeOffsetMins: inputs.hydrationOffsetMins,
    title: "Pre-Race Hydration Baseline",
    detail: "Begin slow ingestion of water or electrolyte fluid (~300-500 mL) to ensure baseline balance."
  });

  // Caffeine
  if (inputs.caffeineOffsetMins !== undefined && !isNaN(inputs.caffeineOffsetMins) && inputs.caffeineOffsetMins > 0) {
    events.push({
      time: formatMinutesToTime(startMins - inputs.caffeineOffsetMins),
      timeOffsetMins: inputs.caffeineOffsetMins,
      title: "Pre-Race Optional Caffeine Timing Checkpoint",
      detail: "Optional caffeine timing checkpoint (~45-60 min before start)."
    });
  }

  // Warmup
  events.push({
    time: formatMinutesToTime(startMins - inputs.warmupOffsetMins),
    timeOffsetMins: inputs.warmupOffsetMins,
    title: "Drills & Warm-Up Start",
    detail: "Begin dynamic stretching and light progressive activation strides."
  });

  // START
  events.push({
    time: inputs.raceStartTime,
    timeOffsetMins: 0,
    title: "RACE START",
    detail: "Cross the start line. Establish target steady pacing immediately."
  });

  // Gels
  if (inputs.gelIntervalMins && inputs.gelIntervalMins > 0) {
    const gelTimes = calculateGelTiming(inputs.raceDurationMins, inputs.gelIntervalMins);
    gelTimes.forEach(mins => {
      events.push({
        time: formatMinutesToTime(startMins + mins),
        timeOffsetMins: -mins,
        title: `Gel Checkpoint (${mins} min)`,
        detail: "Ingest pre-packed gel pouch with hydration helper."
      });
    });
  }

  // Fluids
  if (inputs.fluidIntervalMins && inputs.fluidIntervalMins > 0) {
    const fluidTimes = calculateFluidTiming(inputs.raceDurationMins, inputs.fluidIntervalMins);
    fluidTimes.forEach(mins => {
      events.push({
        time: formatMinutesToTime(startMins + mins),
        timeOffsetMins: -mins,
        title: `Fluid Intake Checkpoint (${mins} min)`,
        detail: "Sip target fluid volumes (~120-200 mL) based on hourly hydration goals."
      });
    });
  }

  // Sodium
  if (inputs.sodiumIntervalMins && inputs.sodiumIntervalMins > 0) {
    const sodiumTimes = calculateSodiumTiming(inputs.raceDurationMins, inputs.sodiumIntervalMins);
    sodiumTimes.forEach(mins => {
      events.push({
        time: formatMinutesToTime(startMins + mins),
        timeOffsetMins: -mins,
        title: `Electrolyte / Sodium Checkpoint (${mins} min)`,
        detail: "Consume electrolyte capsule or salt tablets to maintain blood sodium levels."
      });
    });
  }

  // FINISH
  events.push({
    time: formatMinutesToTime(startMins + inputs.raceDurationMins),
    timeOffsetMins: -inputs.raceDurationMins,
    title: "ESTIMATED RACE FINISH",
    detail: "Target duration completed. Cease effort. Transition immediately to post-race recovery checklist."
  });

  // Sort chronologically (earliest first).
  // E.g., largest positive offset first, down to negative offset
  events.sort((a, b) => b.timeOffsetMins - a.timeOffsetMins);

  return events;
}

export function generateRaceDayKitChecklist(raceType: string, weatherTag: string): string[] {
  const base = [
    "Primary racing singlet / top",
    "Racing shorts or tights",
    "Fitted carbon plated or performance race shoes",
    "Synthetic blister-free running socks",
    "Timing chip and bib (with safety pins or toggle belt)",
    "GPS pacing watch (fully charged to 100%)",
    "Anti-chafing balm / skin lubricant",
    "Planned energy gel stash & fuel carrying belt/pouch"
  ];

  if (weatherTag.toLowerCase() === "hot") {
    base.push(
      "Sun-blocking running cap / visor",
      "UV protection sunglasses",
      "Extra hand-held hydration flask / fuel container",
      "Electrolyte / salt tables stash",
      "Broad-spectrum waterproof sunscreen"
    );
  } else if (weatherTag.toLowerCase() === "cold") {
    base.push(
      "Compression arm sleeves",
      "Lightweight running gloves",
      "Thermal headband / ear warmer",
      "Throwaway old sweater for start line corral waiting"
    );
  } else if (weatherTag.toLowerCase() === "rainy") {
    base.push(
      "Waterproof zip-lock baggies for pacing card / phone",
      "Anti-chafing stick (applied to high risk zones)",
      "Curved brim running cap (to keep water off eyes)",
      "Dry set of clothing and shoes in gear check bag"
    );
  }

  if (raceType.toLowerCase() === "trail") {
    base.push(
      "High-grip active trail running shoes",
      "Rule-compliant whistle / emergency checklist bag",
      "Collapsible cup for water refill checkpoints",
      "Handheld water system / hydration vest (500mL+ capacity)"
    );
  }

  return base;
}

export function calculatePostRaceRecoveryChecklist(raceDistanceCategory: string): string[] {
  const common = [
    "Immediately 0-30 mins: Hydrate with 500mL fluid + sodium. Ingest easily digestible carbohydrates.",
    "First Hour: Change into completely dry clothes and socks to avoid rapid core temperature drop.",
    "Within 2 Hours: Eat a complete balanced meal containing carbohydrates (glycogen synthesis) and proteins (muscle repair).",
    "Rest of Day: Elevate legs for 10-15 minutes. Walk gently; do not sit static for hours on end.",
    "Evening: Soft self-massage / light foam rolling. Refrain from deep painful triggers or intense stretching."
  ];

  if (raceDistanceCategory.toLowerCase() === "marathon" || raceDistanceCategory.toLowerCase() === "ultra") {
    common.push(
      "Days 1-3 Post-Race: Prioritize active recovery like walking, swimming, or lightweight cycling. No running.",
      "Days 4-7 Post-Race: Introduction of short, unstructured conversational jogs only if active scale muscle soreness is gone."
    );
  } else {
    common.push(
      "Days 1-2 Post-Race: Gentle mobility, optional recovery spin. No high-speed intervals.",
      "Day 3 Post-Race: Return to regular aerobic build plan if joint integrity is baseline."
    );
  }

  return common;
}
