'use client';

import { useState, useMemo } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { 
  calculateTotalCarbs, 
  calculateGelCount, 
  calculateChewCount, 
  calculateDrinkMixCarbs, 
  calculateCarbsPerBottle, 
  calculateCarbPerAidStation, 
  calculateTotalFluid, 
  calculateBottleCount, 
  calculateFluidPerBottle, 
  calculateTotalSodium, 
  calculateSodiumPerLiter, 
  calculateSodiumPerBottle, 
  calculateSaltCapsuleCount, 
  calculateSweatLoss, 
  calculateSweatRate, 
  calculateBodyMassLossPercent, 
  calculateFluidReplacementPercent, 
  calculateBottleRecipe, 
  calculateFuelCost, 
  calculateCostPerGramCarb, 
  calculateRaceFuelPlan 
} from '@/lib/calculators_pack/fuelHydrationSystem';
import { parseDurationToSeconds, formatSecondsToTimeString } from '@/lib/formatters/time';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Apple, 
  Droplet, 
  Activity, 
  Sparkles, 
  Compass, 
  Clock, 
  DollarSign, 
  RotateCcw, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Printer
} from 'lucide-react';

type FuelSubModule = 'carb' | 'fluid' | 'sodium' | 'sweat' | 'recipe' | 'timeline' | 'cost';

export default function FuelLabPage() {
  const [activeTab, setActiveTab] = useState<FuelSubModule>('carb');
  const [error, setError] = useState<string | null>(null);
  
  // ---------------------------------------------------------------------------
  // 1. Carb Planner STATE
  // ---------------------------------------------------------------------------
  const [carbDuration, setCarbDuration] = useState('2:30:00');
  const [carbsPerHourInput, setCarbsPerHourInput] = useState('60');
  const [carbsPerGelInput, setCarbsPerGelInput] = useState('25');
  const [chewsPerServingInput, setChewsPerServingInput] = useState('15');
  const [aidStationCountInput, setAidStationCountInput] = useState('4');

  // ---------------------------------------------------------------------------
  // 2. Fluid Planner STATE
  // ---------------------------------------------------------------------------
  const [fluidDuration, setFluidDuration] = useState('2:30:00');
  const [fluidPerHourInput, setFluidPerHourInput] = useState('600');
  const [bottleSizeMlInput, setBottleSizeMlInput] = useState('750');

  // ---------------------------------------------------------------------------
  // 3. Sodium Planner STATE
  // ---------------------------------------------------------------------------
  const [sodiumDuration, setSodiumDuration] = useState('2:30:00');
  const [sodiumPerHourInput, setSodiumPerHourInput] = useState('600');
  const [sodiumTotalFluid, setSodiumTotalFluid] = useState('1.5'); // Liters
  const [sodiumBottleCount, setSodiumBottleCount] = useState('2');
  const [sodiumPerCapsuleInput, setSodiumPerCapsuleInput] = useState('250');

  // ---------------------------------------------------------------------------
  // 4. Sweat Rate STATE
  // ---------------------------------------------------------------------------
  const [preWeight, setPreWeight] = useState('68'); // kg
  const [postWeight, setPostWeight] = useState('67.2'); // kg
  const [sweatFluidIntake, setSweatFluidIntake] = useState('0.6'); // Liters
  const [sweatUrineOutput, setSweatUrineOutput] = useState('0.1'); // Liters
  const [sweatDuration, setSweatDuration] = useState('1:00:00');

  // ---------------------------------------------------------------------------
  // 5. Bottle Recipe STATE
  // ---------------------------------------------------------------------------
  const [recipeBottleSize, setRecipeBottleSize] = useState('700'); // ml
  const [recipeCarbs, setRecipeCarbs] = useState('60'); // g
  const [recipeSodium, setRecipeSodium] = useState('600'); // mg
  const [recipeBottleCount, setRecipeBottleCount] = useState('2');

  // ---------------------------------------------------------------------------
  // 6. Race Fuel Timeline STATE
  // ---------------------------------------------------------------------------
  const [timelineDuration, setTimelineDuration] = useState('3:00:00');
  const [timelineGelInterval, setTimelineGelInterval] = useState('30'); // minutes
  const [timelineDrinkInterval, setTimelineDrinkInterval] = useState('15'); // minutes
  const [timelineSodiumInterval, setTimelineSodiumInterval] = useState('60'); // minutes

  // ---------------------------------------------------------------------------
  // 7. Cost Calculator STATE
  // ---------------------------------------------------------------------------
  const [costGelCount, setCostGelCount] = useState('6');
  const [costGelPrice, setCostGelPrice] = useState('2.50');
  const [costDrinkServings, setCostDrinkServings] = useState('4');
  const [costDrinkPrice, setCostDrinkPrice] = useState('1.80');
  const [costSodiumCaps, setCostSodiumCaps] = useState('4');
  const [costCapPrice, setCapPrice] = useState('0.30');

  // ---------------------------------------------------------------------------
  // RESET HANDLER
  // ---------------------------------------------------------------------------
  const handleReset = () => {
    setError(null);
    if (activeTab === 'carb') {
      setCarbDuration('2:30:00');
      setCarbsPerHourInput('60');
      setCarbsPerGelInput('25');
      setChewsPerServingInput('15');
      setAidStationCountInput('4');
    } else if (activeTab === 'fluid') {
      setFluidDuration('2:30:00');
      setFluidPerHourInput('600');
      setBottleSizeMlInput('750');
    } else if (activeTab === 'sodium') {
      setSodiumDuration('2:30:00');
      setSodiumPerHourInput('600');
      setSodiumTotalFluid('1.5');
      setSodiumBottleCount('2');
      setSodiumPerCapsuleInput('250');
    } else if (activeTab === 'sweat') {
      setPreWeight('68');
      setPostWeight('67.2');
      setSweatFluidIntake('0.6');
      setSweatUrineOutput('0.1');
      setSweatDuration('1:00:00');
    } else if (activeTab === 'recipe') {
      setRecipeBottleSize('700');
      setRecipeCarbs('60');
      setRecipeSodium('600');
      setRecipeBottleCount('2');
    } else if (activeTab === 'timeline') {
      setTimelineDuration('3:00:00');
      setTimelineGelInterval('30');
      setTimelineDrinkInterval('15');
      setTimelineSodiumInterval('60');
    } else if (activeTab === 'cost') {
      setCostGelCount('6');
      setCostGelPrice('2.50');
      setCostDrinkServings('4');
      setCostDrinkPrice('1.80');
      setCostSodiumCaps('4');
      setCapPrice('0.30');
    }
  };

  // ---------------------------------------------------------------------------
  // DERIVED SPACE (DETERMINISTIC FORMULAS)
  // ---------------------------------------------------------------------------
  const results = useMemo(() => {

    if (activeTab === 'carb') {
      const sec = parseDurationToSeconds(carbDuration);
      if (sec === null || sec <= 0) return null;
      const hrs = sec / 3600;
      const rate = parseFloat(carbsPerHourInput) || 0;
      const perGel = parseFloat(carbsPerGelInput) || 1;
      const perChew = parseFloat(chewsPerServingInput) || 1;
      const aidCount = parseInt(aidStationCountInput, 10) || 0;

      const totalC = calculateTotalCarbs(hrs, rate);
      const gels = calculateGelCount(totalC, perGel);
      const chews = calculateChewCount(totalC, perChew);
      const perAid = calculateCarbPerAidStation(totalC, aidCount);

      const trace = `Step 1: Convert Duration to Hours = ${carbDuration} -> ${hrs.toFixed(4)} hours.\n` +
        `Step 2: Calculate Total Carbs Needed = ${hrs.toFixed(4)} hrs × ${rate} g/hr = ${totalC.toFixed(1)}g.\n` +
        `Step 3: Calculate Gel Equivalent = ${totalC.toFixed(1)}g / ${perGel}g per gel = ${gels.toFixed(2)} gels.\n` +
        `Step 4: Calculate Chew Serving Equivalent = ${totalC.toFixed(1)}g / ${perChew}g per serving = ${chews.toFixed(2)} chew servings.\n` +
        `Step 5: Calculate Carbs per Aid Station = ${totalC.toFixed(1)}g / ${aidCount} stations = ${perAid.toFixed(1)}g.`;

      const barData = [
        { name: 'Gels Required', Count: parseFloat(gels.toFixed(1)) },
        { name: 'Chew portions', Count: parseFloat(chews.toFixed(1)) }
      ];

      return {
        totalC,
        gels,
        chews,
        perAid,
        trace,
        barData,
        inputsUsed: {
          'Duration': carbDuration,
          'Rate per hr': `${rate}g`,
          'Carbs per gel': `${perGel}g`,
          'Chew servings': `${perChew}g`,
          'Aid stations': aidCount
        }
      };
    }

    if (activeTab === 'fluid') {
      const sec = parseDurationToSeconds(fluidDuration);
      if (sec === null || sec <= 0) return null;
      const hrs = sec / 3600;
      const rate = parseFloat(fluidPerHourInput) || 0;
      const bSize = parseFloat(bottleSizeMlInput) || 500;

      const totalF = calculateTotalFluid(hrs, rate);
      const bottles = calculateBottleCount(totalF, bSize);
      const fluidPerB = calculateFluidPerBottle(totalF, Math.ceil(bottles));

      const trace = `Step 1: Convert Duration to Hours = ${fluidDuration} -> ${hrs.toFixed(4)} hours.\n` +
        `Step 2: Calculate Total Fluid = ${hrs.toFixed(4)} hrs × ${rate} mL/hr = ${totalF.toFixed(0)} mL.\n` +
        `Step 3: Calculate Bottle Count Needed = ${totalF.toFixed(0)} mL / ${bSize} mL size = ${bottles.toFixed(2)} bottles.\n` +
        `Step 4: Calculate Fluid Volume per Bottle = ${totalF.toFixed(0)} mL / ${Math.ceil(bottles)} bottles = ${fluidPerB.toFixed(0)} mL.`;

      const barData = [
        { name: 'Flasks Needed', Count: parseFloat(bottles.toFixed(1)) }
      ];

      return {
        totalF,
        bottles,
        fluidPerB,
        trace,
        barData,
        inputsUsed: {
          'Duration': fluidDuration,
          'Rate': `${rate}mL/h`,
          'Bottle volume': `${bSize}mL`
        }
      };
    }

    if (activeTab === 'sodium') {
      const sec = parseDurationToSeconds(sodiumDuration);
      if (sec === null || sec <= 0) return null;
      const hrs = sec / 3600;
      const rate = parseFloat(sodiumPerHourInput) || 0;
      const tFluid = parseFloat(sodiumTotalFluid) || 1.0;
      const bCount = parseFloat(sodiumBottleCount) || 1;
      const capS = parseFloat(sodiumPerCapsuleInput) || 200;

      const totalS = calculateTotalSodium(hrs, rate);
      const perLiter = calculateSodiumPerLiter(totalS, tFluid);
      const perBottle = calculateSodiumPerBottle(totalS, bCount);
      const capsules = calculateSaltCapsuleCount(totalS, capS);

      const trace = `Step 1: Convert Duration to Hours = ${sodiumDuration} -> ${hrs.toFixed(4)} hours.\n` +
        `Step 2: Calculate Total Sodium = ${hrs.toFixed(4)} hrs × ${rate} mg/hr = ${totalS.toFixed(0)} mg.\n` +
        `Step 3: Calculate Sodium concentration per Liter = ${totalS.toFixed(0)} mg / ${tFluid} Liters = ${perLiter.toFixed(0)} mg/L.\n` +
        `Step 4: Calculate Sodium per Bottle = ${totalS.toFixed(0)} mg / ${bCount} bottles = ${perBottle.toFixed(0)} mg per bottle.\n` +
        `Step 5: Calculate Salt Capsule count = ${totalS.toFixed(0)} mg / ${capS} mg/capsule = ${capsules.toFixed(1)} caps.`;

      const barData = [
        { name: 'Capsules', Count: parseFloat(capsules.toFixed(1)) }
      ];

      return {
        totalS,
        perLiter,
        perBottle,
        capsules,
        trace,
        barData,
        inputsUsed: {
          'Duration': sodiumDuration,
          'Rate': `${rate}mg/h`,
          'Total fluid context': `${tFluid}L`,
          'Bottle context': bCount,
          'Per capsule size': `${capS}mg`
        }
      };
    }

    if (activeTab === 'sweat') {
      const sec = parseDurationToSeconds(sweatDuration);
      if (sec === null || sec <= 0) return null;
      const hrs = sec / 3600;

      const preW = parseFloat(preWeight) || 0;
      const postW = parseFloat(postWeight) || 0;
      const fIn = parseFloat(sweatFluidIntake) || 0;
      const uOut = parseFloat(sweatUrineOutput) || 0;

      if (preW <= 0 || postW <= 0 || preW < postW) {
        return null;
      }

      const totalLoss = calculateSweatLoss(preW, postW, fIn, uOut);
      const rate = calculateSweatRate(totalLoss, hrs);
      const massLossPct = calculateBodyMassLossPercent(preW, postW);
      const replPct = calculateFluidReplacementPercent(fIn, totalLoss);

      const trace = `Step 1: Calculate Sweat Loss Liters = (PreWeight ${preW}kg - PostWeight ${postW}kg) + fluidIntake ${fIn}L - urine ${uOut}L = ${totalLoss.toFixed(2)} Liters.\n` +
        `Step 2: Calculate Sweat Rate = Loss ${totalLoss.toFixed(2)}L / durationHrs ${hrs.toFixed(4)} = ${rate.toFixed(2)} L/hr.\n` +
        `Step 3: Calculate Body Mass loss % = (${preW} - ${postW}) / ${preW} × 100 = ${massLossPct.toFixed(1)}%.\n` +
        `Step 4: Calculate Fluid Replacement % = ${fIn}L intake / ${totalLoss.toFixed(2)}L sweat loss × 100 = ${replPct.toFixed(1)}%.`;

      const barData = [
        { name: 'Sweat Loss (L)', Vol: parseFloat(totalLoss.toFixed(2)) },
        { name: 'Fluid Intake (L)', Vol: parseFloat(fIn.toFixed(2)) }
      ];

      return {
        totalLoss,
        rate,
        massLossPct,
        replPct,
        trace,
        barData,
        inputsUsed: {
          'Pre mass': `${preW}kg`,
          'Post mass': `${postW}kg`,
          'Intake during': `${fIn}L`,
          'Urine loss': `${uOut}L`,
          'Duration': sweatDuration
        }
      };
    }

    if (activeTab === 'recipe') {
      const bSize = parseFloat(recipeBottleSize) || 500;
      const carbsB = parseFloat(recipeCarbs) || 40;
      const sodB = parseFloat(recipeSodium) || 400;
      const count = parseInt(recipeBottleCount, 10) || 1;

      const totalCarbs = carbsB * count;
      const totalSod = sodB * count;
      const totalVolume = bSize * count;

      const { carbConcentration, sodiumConcentration, instructions } = calculateBottleRecipe(carbsB, sodB, bSize);

      const trace = `Step 1: Recipe per Bottle Concentration = (${carbsB}g carbs / ${bSize}mL volume) × 100 = ${carbConcentration.toFixed(1)}% Carb Solution.\n` +
        `Step 2: Sodium density per Bottle = ${sodB}mg sodium / ${bSize}mL = ${(sodB / (bSize / 1000)).toFixed(0)} mg/L.\n` +
        `Step 3: Multiply by Bottle count (${count}) -> Total Carb ${totalCarbs}g, Total Sodium ${totalSod}mg, Total Fluid ${totalVolume}mL.`;

      const barData = [
        { name: 'Carbs concentration %', Value: parseFloat(carbConcentration.toFixed(1)) }
      ];

      return {
        totalCarbs,
        totalSod,
        totalVolume,
        carbConcentration,
        sodiumConcentration,
        instructions,
        trace,
        barData,
        inputsUsed: {
          'Bottle volume': `${bSize}ml`,
          'Carb per bottle': `${carbsB}g`,
          'Sodium per bottle': `${sodB}mg`,
          'Count': count
        }
      };
    }

    if (activeTab === 'timeline') {
      const sec = parseDurationToSeconds(timelineDuration);
      if (sec === null || sec <= 0) return null;
      const minsTotal = sec / 60;

      const gelInt = parseFloat(timelineGelInterval) || 30;
      const drinkInt = parseFloat(timelineDrinkInterval) || 15;
      const sodInt = parseFloat(timelineSodiumInterval) || 0;

      const checkpointsPlan = calculateRaceFuelPlan(minsTotal, gelInt, drinkInt, sodInt);

      const trace = `Step 1: Calculate timelines for Gel checkpoints every ${gelInt} min, Hydration sips every ${drinkInt} min, and discretionary Sodium every ${sodInt} min.\n` +
        `Step 2: Generate sorted action table for total duration of ${minsTotal.toFixed(0)} mins.`;

      const barData = [
        { name: 'Fueling Checkpoints', Count: checkpointsPlan.length }
      ];

      return {
        checkpointsPlan,
        trace,
        barData,
        inputsUsed: {
          'Duration': timelineDuration,
          'Gel interval': `${gelInt}m`,
          'Hydration interval': `${drinkInt}m`,
          'Sodium interval': `${sodInt}m`
        }
      };
    }

    if (activeTab === 'cost') {
      const gCent = parseFloat(costGelCount) || 0;
      const gPrice = parseFloat(costGelPrice) || 0;
      const dServs = parseFloat(costDrinkServings) || 0;
      const dPrice = parseFloat(costDrinkPrice) || 0;
      const sCaps = parseFloat(costSodiumCaps) || 0;
      const sPrice = parseFloat(costCapPrice) || 0;

      const totalCost = calculateFuelCost(gCent, gPrice, dServs, dPrice, sCaps, sPrice);
      
      const trace = `Step 1: Calculate Gel Expense = ${gCent} × $${gPrice.toFixed(2)} = $${(gCent * gPrice).toFixed(2)}\n` +
        `Step 2: Calculate Drink Mix Expense = ${dServs} × $${dPrice.toFixed(2)} = $${(dServs * dPrice).toFixed(2)}\n` +
        `Step 3: Calculate Sodium Capsule Expense = ${sCaps} × $${sPrice.toFixed(2)} = $${(sCaps * sPrice).toFixed(2)}\n` +
        `Step 4: Calculate Sum = $${totalCost.toFixed(2)}`;

      const barData = [
        { name: 'Gels', Cost: parseFloat((gCent * gPrice).toFixed(2)) },
        { name: 'Drinks', Cost: parseFloat((dServs * dPrice).toFixed(2)) },
        { name: 'Cap', Cost: parseFloat((sCaps * sPrice).toFixed(2)) }
      ];

      return {
        totalCost,
        trace,
        barData,
        inputsUsed: {
          'Gel entries': `${gCent} ea @ $${gPrice}`,
          'Mix entries': `${dServs} ea @ $${dPrice}`,
          'Cap entries': `${sCaps} ea @ $${sPrice}`
        }
      };
    }

    return null;
  }, [
    activeTab,
    carbDuration, carbsPerHourInput, carbsPerGelInput, chewsPerServingInput, aidStationCountInput,
    fluidDuration, fluidPerHourInput, bottleSizeMlInput,
    sodiumDuration, sodiumPerHourInput, sodiumTotalFluid, sodiumBottleCount, sodiumPerCapsuleInput,
    preWeight, postWeight, sweatFluidIntake, sweatUrineOutput, sweatDuration,
    recipeBottleSize, recipeCarbs, recipeSodium, recipeBottleCount,
    timelineDuration, timelineGelInterval, timelineDrinkInterval, timelineSodiumInterval,
    costGelCount, costGelPrice, costDrinkServings, costDrinkPrice, costSodiumCaps, costCapPrice
  ]);

  // Guidelines Cautions
  const warnings = useMemo(() => {
    if (!results) return [];
    const arr: string[] = [];
    if (activeTab === 'carb') {
      const val = parseFloat(carbsPerHourInput) || 0;
      if (val > 90) {
        arr.push('Entering carbs > 90g/hr. This demands deliberate gut training and multi-source glucose/fructose carbohydrate mixes (such as 1:0.8 ratios) to minimize GI stress.');
      }
    }
    if (activeTab === 'sweat' && results.rate && results.rate > 1.8) {
      arr.push('Calculated sweat rate is exceptionally high. Heavy sweat environments call for structured sodium budgeting to limit hyponatremia risks. (This is a physiological estimate, not medical advice).');
    }
    if (activeTab === 'sweat' && results.massLossPct && results.massLossPct > 3.0) {
      arr.push('Calculated body weight drop exceeds 3%. Avoid extreme cumulative fluid deficits to preserve motor economy, cardiovascular output, and standard metabolic rates.');
    }
    return arr;
  }, [results, activeTab, carbsPerHourInput]);

  // Export Data Content
  const exportData = useMemo(() => {
    if (!results) return '';
    return `TRACK.LAB FUEL & HYDRATION WORKSPACE REPORT
Generated: ${new Date().toISOString()}
Module: ${activeTab.toUpperCase()}
Inputs: ${JSON.stringify(results.inputsUsed, null, 2)}
Formula Step-by-Step Trace:
${results.trace}
Standard Caution: Estimates are based on deterministic formulas and typical metabolic values. Not medical diagnostics, nutrition advice, or clinical guidelines.`;
  }, [results, activeTab]);

  return (
    <CalculatorPageShell 
      title="Fuel & Hydration Lab" 
      subtitle="Manually coordinate race fueling structures, sweat rate variables, sodium balances, and bottle osmolarity recipes."
    >
      {/* Sub Module Switcher */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4" id="fuel_sub_switcher">
        <button 
          onClick={() => { setActiveTab('carb'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'carb' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Apple className="inline h-3.5 w-3.5 mr-1" /> Carb Planner
        </button>
        <button 
          onClick={() => { setActiveTab('fluid'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'fluid' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Droplet className="inline h-3.5 w-3.5 mr-1" /> Fluid Planner
        </button>
        <button 
          onClick={() => { setActiveTab('sodium'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'sodium' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Activity className="inline h-3.5 w-3.5 mr-1" /> Sodium Planner
        </button>
        <button 
          onClick={() => { setActiveTab('sweat'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'sweat' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Sparkles className="inline h-3.5 w-3.5 mr-1" /> Sweat Calculator
        </button>
        <button 
          onClick={() => { setActiveTab('recipe'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'recipe' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Compass className="inline h-3.5 w-3.5 mr-1" /> Bottle Recipe
        </button>
        <button 
          onClick={() => { setActiveTab('timeline'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'timeline' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Clock className="inline h-3.5 w-3.5 mr-1" /> Race Fuel Timeline
        </button>
        <button 
          onClick={() => { setActiveTab('cost'); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'cost' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <DollarSign className="inline h-3.5 w-3.5 mr-1" /> Cost Calculator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Grid: Input forms */}
        <div className="space-y-6">
          <ManualInputPanel
            mode="quick"
            setMode={() => {}}
            supportsAdvanced={false}
            onCalculate={() => {}}
            onReset={handleReset}
            error={error}
          >
            {activeTab === 'carb' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Carbohydrate Planner</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carbDuration">Target Session Duration</Label>
                    <Input id="carbDuration" value={carbDuration} onChange={(e) => setCarbDuration(e.target.value)} placeholder="HH:MM:SS" />
                  </div>
                  <div>
                    <Label htmlFor="carbsPerHourInput">Carbs per Hour (g)</Label>
                    <Input id="carbsPerHourInput" type="number" value={carbsPerHourInput} onChange={(e) => setCarbsPerHourInput(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <Label htmlFor="carbsPerGelInput">g Carbs / Gel</Label>
                    <Input id="carbsPerGelInput" type="number" value={carbsPerGelInput} onChange={(e) => setCarbsPerGelInput(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="chewsPerServingInput">g Carbs / Chew Portion</Label>
                    <Input id="chewsPerServingInput" type="number" value={chewsPerServingInput} onChange={(e) => setChewsPerServingInput(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="aidStationCountInput">Number of Aid Stations</Label>
                    <Input id="aidStationCountInput" type="number" value={aidStationCountInput} onChange={(e) => setAidStationCountInput(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fluid' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Fluid Hydration Planner</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="fluidDuration">Effort Duration</Label>
                    <Input id="fluidDuration" value={fluidDuration} onChange={(e) => setFluidDuration(e.target.value)} placeholder="HH:MM:SS" />
                  </div>
                  <div>
                    <Label htmlFor="fluidPerHourInput">Fluid Intake Goal (mL/h)</Label>
                    <Input id="fluidPerHourInput" type="number" value={fluidPerHourInput} onChange={(e) => setFluidPerHourInput(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="bottleSizeMlInput">Bottle size (mL)</Label>
                    <Input id="bottleSizeMlInput" type="number" value={bottleSizeMlInput} onChange={(e) => setBottleSizeMlInput(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sodium' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Sodium Concentration Planner</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sodiumDuration">Session Duration</Label>
                    <Input id="sodiumDuration" value={sodiumDuration} onChange={(e) => setSodiumDuration(e.target.value)} placeholder="HH:MM:SS" />
                  </div>
                  <div>
                    <Label htmlFor="sodiumPerHourInput">Sodium Target (mg/h)</Label>
                    <Input id="sodiumPerHourInput" type="number" value={sodiumPerHourInput} onChange={(e) => setSodiumPerHourInput(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <Label htmlFor="sodiumTotalFluid">Total Water Vol (L)</Label>
                    <Input id="sodiumTotalFluid" type="number" step="0.1" value={sodiumTotalFluid} onChange={(e) => setSodiumTotalFluid(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="sodiumBottleCount">Total Flask Count</Label>
                    <Input id="sodiumBottleCount" type="number" value={sodiumBottleCount} onChange={(e) => setSodiumBottleCount(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="sodiumPerCapsuleInput">mg Sodium / Capsule</Label>
                    <Input id="sodiumPerCapsuleInput" type="number" value={sodiumPerCapsuleInput} onChange={(e) => setSodiumPerCapsuleInput(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sweat' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Sweat Rate Weigh-In Test</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preWeight">Pre-Run Mass (kg)</Label>
                    <Input id="preWeight" type="number" step="0.05" value={preWeight} onChange={(e) => setPreWeight(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="postWeight">Post-Run Mass (kg)</Label>
                    <Input id="postWeight" type="number" step="0.05" value={postWeight} onChange={(e) => setPostWeight(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <Label htmlFor="sweatFluidIntake">Fluid Drank (Liters)</Label>
                    <Input id="sweatFluidIntake" type="number" step="0.05" value={sweatFluidIntake} onChange={(e) => setSweatFluidIntake(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="sweatUrineOutput">Urine Loss (Liters)</Label>
                    <Input id="sweatUrineOutput" type="number" step="0.05" value={sweatUrineOutput} onChange={(e) => setSweatUrineOutput(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="sweatDuration">Test Duration</Label>
                    <Input id="sweatDuration" value={sweatDuration} onChange={(e) => setSweatDuration(e.target.value)} placeholder="HH:MM:SS" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recipe' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Tailored Bottle Recipe Builder</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipeBottleSize">Flask Volume (mL)</Label>
                    <Input id="recipeBottleSize" type="number" value={recipeBottleSize} onChange={(e) => setRecipeBottleSize(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="recipeBottleCount">Target Flask Count</Label>
                    <Input id="recipeBottleCount" type="number" value={recipeBottleCount} onChange={(e) => setRecipeBottleCount(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="recipeCarbs">Carbohydrate per Bottle (g)</Label>
                    <Input id="recipeCarbs" type="number" value={recipeCarbs} onChange={(e) => setRecipeCarbs(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="recipeSodium">Sodium per Bottle (mg)</Label>
                    <Input id="recipeSodium" type="number" value={recipeSodium} onChange={(e) => setRecipeSodium(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Race Checking Timeline</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timelineDuration">Race / Session Time</Label>
                    <Input id="timelineDuration" value={timelineDuration} onChange={(e) => setTimelineDuration(e.target.value)} placeholder="HH:MM:SS" />
                  </div>
                  <div>
                    <Label htmlFor="timelineGelInterval">Carb Interval (min)</Label>
                    <Input id="timelineGelInterval" type="number" value={timelineGelInterval} onChange={(e) => setTimelineGelInterval(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="timelineDrinkInterval">Fluid Rec Sip (min)</Label>
                    <Input id="timelineDrinkInterval" type="number" value={timelineDrinkInterval} onChange={(e) => setTimelineDrinkInterval(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="timelineSodiumInterval">Capsule Interval (min, opt)</Label>
                    <Input id="timelineSodiumInterval" type="number" value={timelineSodiumInterval} onChange={(e) => setTimelineSodiumInterval(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cost' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Fuel Expense Calculator</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costGelCount">Gels Consumed</Label>
                    <Input id="costGelCount" type="number" value={costGelCount} onChange={(e) => setCostGelCount(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="costGelPrice">Price per Gel ($)</Label>
                    <Input id="costGelPrice" type="number" step="0.05" value={costGelPrice} onChange={(e) => setCostGelPrice(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="costDrinkServings">Drink Mix Servings</Label>
                    <Input id="costDrinkServings" type="number" value={costDrinkServings} onChange={(e) => setCostDrinkServings(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="costDrinkPrice">Price / Serving ($)</Label>
                    <Input id="costDrinkPrice" type="number" step="0.05" value={costDrinkPrice} onChange={(e) => setCostDrinkPrice(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="costSodiumCaps">Sodium Capsules</Label>
                    <Input id="costSodiumCaps" type="number" value={costSodiumCaps} onChange={(e) => setCostSodiumCaps(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="costCapPrice">Price / Cap ($)</Label>
                    <Input id="costCapPrice" type="number" step="0.05" value={costCapPrice} onChange={(e) => setCapPrice(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </ManualInputPanel>

          {/* Honest cross links block */}
          <div className="border-2 border-border-heavy p-4 rounded-xl space-y-2 bg-card shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <div className="text-xs uppercase font-bold text-muted-foreground flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" /> Honest Lab Integration
            </div>
            <ul className="text-xs space-y-1 text-slate-600">
              <li>• Link to <a href="/test" className="text-primary hover:underline font-semibold">Test Lab</a>: Coordinate sweat tests with endurance benchmarks</li>
              <li>• Link to <a href="/race-day" className="text-primary hover:underline font-semibold">Race Day Lab</a>: Configure pacing maps and timing projections</li>
              <li>• Link to <a href="/environment" className="text-primary hover:underline font-semibold">Environment Lab</a>: Account for heat indices, altitudes, and humidity offsets</li>
              <li>• Link to <a href="/gear" className="text-primary hover:underline font-semibold">Gear Lab</a>: Check fueling budget impacts alongside shoes or vests</li>
            </ul>
          </div>
        </div>

        {/* Right Grid: Result and details */}
        <div className="space-y-6">
          {results ? (
            (() => {
              const res = results as any;
              return (
                <>
                  <ResultCard
                    result={{
                      result: (
                        <div className="w-full space-y-6" id="fuel_calculator_results">
                          {activeTab === 'carb' && (
                            <div className="space-y-4">
                              <div className="p-5 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Total Effort Carbs</span>
                                <span className="font-display text-5xl font-black text-primary">{Math.round(res.totalC)} grams</span>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Gels Needed</span>
                                  <div className="text-xl font-mono font-black text-foreground">{res.gels.toFixed(1)}</div>
                                </div>
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Chews Serving</span>
                                  <div className="text-xl font-mono font-black text-foreground">{res.chews.toFixed(1)}</div>
                                </div>
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Carbs/Sta (opt)</span>
                                  <div className="text-xl font-mono font-black text-foreground">{res.perAid.toFixed(1)}g</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'fluid' && (
                            <div className="space-y-4">
                              <div className="p-5 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Total Fluid Intake</span>
                                <span className="font-display text-5xl font-black text-blue-500">{(res.totalF / 1000).toFixed(2)} Liters</span>
                                <span className="text-xs text-muted-foreground block mt-1">({Math.round(res.totalF)} mL total)</span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border border-border bg-card rounded-lg text-center">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Flasks / Bottles</span>
                                  <div className="text-lg font-mono font-black">{res.bottles.toFixed(1)}</div>
                                </div>
                                <div className="p-3 border border-border bg-card rounded-lg text-center">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">mL per Flask</span>
                                  <div className="text-lg font-mono font-black">{Math.round(res.fluidPerB)} mL</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'sodium' && (
                            <div className="space-y-4">
                              <div className="p-5 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Total Sodium Needed</span>
                                <span className="font-display text-4xl font-black text-foreground">{Math.round(res.totalS)} mg</span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 border border-border bg-card rounded-lg">
                                  <span className="text-[8px] uppercase font-bold text-muted-foreground">mg / Liter</span>
                                  <div className="text-xs font-mono font-bold">{Math.round(res.perLiter)} mg</div>
                                </div>
                                <div className="p-2 border border-border bg-card rounded-lg">
                                  <span className="text-[8px] uppercase font-bold text-muted-foreground">mg / Bottle</span>
                                  <div className="text-xs font-mono font-bold">{Math.round(res.perBottle)} mg</div>
                                </div>
                                <div className="p-2 border border-border bg-card rounded-lg">
                                  <span className="text-[8px] uppercase font-bold text-muted-foreground">Caps Count</span>
                                  <div className="text-xs font-mono font-bold">{res.capsules.toFixed(1)}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'sweat' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Sweat Rate Estimate</span>
                                  <span className="font-display text-3xl font-black text-blue-500">{res.rate.toFixed(2)} L/hr</span>
                                </div>
                                <div className="p-4 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Total Loss Vol</span>
                                  <span className="font-display text-3xl font-black text-foreground">{res.totalLoss.toFixed(2)} Liters</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 border border-border bg-card rounded-lg">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Dehydration / Mass Loss</span>
                                  <div className={`text-md font-mono font-black ${res.massLossPct > 2.5 ? 'text-amber-500' : 'text-primary'}`}>
                                    {res.massLossPct.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="p-3 border border-border bg-card rounded-lg">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Fluid Replacement</span>
                                  <div className="text-md font-mono font-black text-foreground">
                                    {res.replPct.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'recipe' && (
                            <div className="space-y-4">
                              <div className="p-4 border-2 border-border-heavy bg-amber-50 border-amber-400 text-amber-900 rounded-xl">
                                <span className="text-[10px] uppercase font-black tracking-widest block mb-1">Recipe Concentration Results</span>
                                <div className="text-xs font-mono space-y-1">
                                  <div>• Carbs Osmolarity: <strong>{res.carbConcentration.toFixed(1)}%</strong> (Optimal: 4-8% loop speed)</div>
                                  <div>• Sodium Concentration: <strong>{res.sodiumConcentration.toFixed(2)} mg/mL</strong></div>
                                </div>
                              </div>

                              <div className="p-4 border border-border bg-card rounded-lg space-y-1 text-xs">
                                <span className="font-bold text-muted-foreground">Osmotic Instructions:</span>
                                <p className="text-xs leading-relaxed text-slate-700">{res.instructions}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-2 border border-border bg-muted/20 rounded-lg">
                                  <span className="text-[8px] font-bold text-muted-foreground">TOTAL CARBS</span>
                                  <div className="font-mono font-bold">{res.totalCarbs}g</div>
                                </div>
                                <div className="p-2 border border-border bg-muted/20 rounded-lg">
                                  <span className="text-[8px] font-bold text-muted-foreground">TOTAL SODIUM</span>
                                  <div className="font-mono font-bold">{res.totalSod}mg</div>
                                </div>
                                <div className="p-2 border border-border bg-muted/20 rounded-lg">
                                  <span className="text-[8px] font-bold text-muted-foreground">TOTAL WATER</span>
                                  <div className="font-mono font-bold">{res.totalVolume}mL</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'timeline' && (
                            <div className="space-y-4">
                              <div className="text-xs font-bold uppercase text-muted-foreground pb-1 border-b border-border">Race Day Checkpoint Timeline</div>
                              <div className="max-h-[250px] overflow-y-auto border border-border rounded-xl bg-card">
                                <table className="w-full text-xs font-mono">
                                  <thead>
                                    <tr className="bg-muted text-muted-foreground uppercase text-[8px] tracking-widest border-b border-border">
                                      <th className="p-2 text-left">Minute</th>
                                      <th className="p-2 text-left">Action</th>
                                      <th className="p-2 text-left">Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {res.checkpointsPlan.length > 0 ? (
                                      res.checkpointsPlan.map((pt: any, idx: number) => (
                                        <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                                          <td className="p-2 font-bold text-primary">{pt.minute}m</td>
                                          <td className="p-2">{pt.action}</td>
                                          <td className="p-2 text-muted-foreground">{pt.amount}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="p-4 text-center text-muted-foreground">No checkpoints generated. Adjust intervals to fit duration.</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {activeTab === 'cost' && (
                            <div className="space-y-4 text-center">
                              <div className="p-5 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Total Session Expense</span>
                                <span className="font-display text-4xl font-black text-green-600">${res.totalCost.toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          {/* Warnings Display */}
                          {warnings && warnings.length > 0 && (
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg space-y-1 text-xs text-amber-800">
                              <div className="font-bold flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" /> Intake Warnings (Non-Clinical Estimates)
                              </div>
                              {warnings.map((w, idx) => (
                                <div key={idx}>• {w}</div>
                              ))}
                            </div>
                          )}

                          {/* Visual display container */}
                          <div className="h-[180px] w-full pt-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={res.barData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#fff', borderRadius: '8px' }} />
                                <Bar 
                                  dataKey={activeTab === 'cost' ? 'Cost' : activeTab === 'sweat' ? 'Vol' : activeTab === 'recipe' ? 'Value' : 'Count'} 
                                  fill={activeTab === 'cost' ? '#16a34a' : '#2563eb'} 
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ),
                      inputUsed: res.inputsUsed,
                      methodSelected: activeTab === 'carb' ? 'Total Carbohydrate Demand' : activeTab === 'fluid' ? 'Hydration Target Budget' : activeTab === 'sodium' ? 'Sodium Concentration Estimator' : activeTab === 'sweat' ? 'Sweat Loss Test' : activeTab === 'recipe' ? 'Osmotic Recipe Concentration' : activeTab === 'timeline' ? 'Structured Fueling check points' : 'Fueling Cost Calculator',
                      formulaUsed: activeTab === 'carb' ? 'Total Carbs = Duration × g/hr' : activeTab === 'sweat' ? 'Sweat loss = (Pre — Post) + fluidIntake — urine' : 'Recipe Concentration % = carbsG / mL',
                      limitations: 'Fluid, carbohydrate, and sodium parameters provide mathematical scenarios and baseline estimation arrays only. Individual gut tolerances and salt concentrations vary greatly. This page does not support clinical diagnosis, nutrition prescriptions, or dehydration prognosis.',
                      confidenceLabel: 'Target Estimate'
                    }}
                  />
                  
                  <ExportPanel textToCopy={exportData} />
                </>
              );
            })()
          ) : (
            <div className="p-8 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center min-h-[300px] shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input Entries</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}
