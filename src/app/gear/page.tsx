'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  calculateShoeRemainingKm,
  calculateShoeUsagePercent,
  calculateShoeCostPerKm,
  calculateShoeCostPerUse,
  compareShoes,
  calculateRaceShoeAfterEvent,
  calculateGelCost,
  calculateDrinkMixServingCost,
  calculateCostPerGramCarb,
  calculateCostPerBottle,
  calculateRaceFuelCost,
  generateRaceKitChecklist,
  calculateWatchBatteryMargin
} from '@/lib/calculators_pack';
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
  ShoppingBag, 
  Battery, 
  RefreshCw, 
  Copy, 
  FileText, 
  Sliders, 
  Bookmark, 
  SlidersHorizontal, 
  Layers, 
  CheckSquare, 
  Activity, 
  Ruler, 
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

export default function GearPage() {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'shoe_amort' | 'rotation_compare' | 'carb_economics' | 'race_checklist' | 'battery_buffer'>('shoe_amort');
  const [error, setError] = useState<string | null>(null);

  // --- Quick Mode States ---
  const [quickShoePrice, setQuickShoePrice] = useState('160');
  const [quickMaxMileage, setQuickMaxMileage] = useState('600');
  const [quickCurrentMileage, setQuickCurrentMileage] = useState('250');
  const [quickGelsPrice, setQuickGelsPrice] = useState('3.50');
  const [quickGelsCount, setQuickGelsCount] = useState('4');

  // --- Advanced Mode States ---
  // A. Shoe Wear & Amortization
  const [shoePrice, setShoePrice] = useState('180');
  const [maxMileageStr, setMaxMileageStr] = useState('650');
  const [currentMileageStr, setCurrentMileageStr] = useState('320');
  const [upcomingRaceDist, setUpcomingRaceDist] = useState('42.2'); // marathon default

  // B. Shoe Rotation Head-to-Head Compare
  const [shoeAName, setShoeAName] = useState('Speed SuperFly');
  const [shoeAPrice, setShoeAPrice] = useState('220');
  const [shoeAMax, setShoeAMax] = useState('600');
  const [shoeACurrent, setShoeACurrent] = useState('420');

  const [shoeBName, setShoeBName] = useState('Daily Cruiser Glide');
  const [shoeBPrice, setShoeBPrice] = useState('140');
  const [shoeBMax, setShoeBMax] = useState('800');
  const [shoeBCurrent, setShoeBCurrent] = useState('150');

  // C. Carbohydrate Fuel Economic Density
  const [gelCostInput, setGelCostInput] = useState('3.50');
  const [gelCarbsInput, setGelCarbsInput] = useState('28'); // grams
  const [gelsSessionCount, setGelsSessionCount] = useState('4');

  const [mixPackPriceInput, setMixPackPriceInput] = useState('45.00');
  const [mixServingsInput, setMixServingsInput] = useState('15');
  const [mixCarbsPerServing, setMixCarbsPerServing] = useState('80'); // grams
  const [mixSessionServings, setMixSessionServings] = useState('1');

  // D. Race Kit Checklist Setup
  const [checklistRaceType, setChecklistRaceType] = useState('race_marathon');
  const [checklistWeather, setChecklistWeather] = useState('weather_cold');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // E. Watch GPS Battery Safeguard
  const [watchBatteryLifeHours, setWatchBatteryLifeHours] = useState('15');
  const [expectedRaceCompletionHours, setExpectedRaceCompletionHours] = useState('3.5');

  // --- Reset All States ---
  const handleReset = () => {
    setQuickShoePrice('160');
    setQuickMaxMileage('600');
    setQuickCurrentMileage('250');
    setQuickGelsPrice('3.50');
    setQuickGelsCount('4');
    setShoePrice('180');
    setMaxMileageStr('650');
    setCurrentMileageStr('320');
    setUpcomingRaceDist('42.2');
    setShoeAName('Speed SuperFly');
    setShoeAPrice('220');
    setShoeAMax('600');
    setShoeACurrent('420');
    setShoeBName('Daily Cruiser Glide');
    setShoeBPrice('140');
    setShoeBMax('800');
    setShoeBCurrent('150');
    setGelCostInput('3.50');
    setGelCarbsInput('28');
    setGelsSessionCount('4');
    setMixPackPriceInput('45.00');
    setMixServingsInput('15');
    setMixCarbsPerServing('80');
    setMixSessionServings('1');
    setChecklistRaceType('race_marathon');
    setChecklistWeather('weather_cold');
    setCheckedItems({});
    setWatchBatteryLifeHours('15');
    setExpectedRaceCompletionHours('3.5');
    setError(null);
  };

  // --- Computations ---

  // Quick Mode Calcs
  const quickRemaining = useMemo(() => {
    const max = parseFloat(quickMaxMileage);
    const cur = parseFloat(quickCurrentMileage);
    if (isNaN(max) || isNaN(cur)) return 0;
    return calculateShoeRemainingKm(max, cur);
  }, [quickMaxMileage, quickCurrentMileage]);

  const quickCostKm = useMemo(() => {
    const val = parseFloat(quickShoePrice);
    const max = parseFloat(quickMaxMileage);
    if (isNaN(val) || isNaN(max) || max <= 0) return 0;
    return calculateShoeCostPerKm(val, max);
  }, [quickShoePrice, quickMaxMileage]);

  const quickFuelCostValue = useMemo(() => {
    const p = parseFloat(quickGelsPrice);
    const c = parseFloat(quickGelsCount);
    if (isNaN(p) || isNaN(c)) return 0;
    return calculateGelCost(c, p);
  }, [quickGelsPrice, quickGelsCount]);

  // Advanced A: Shoe Wear & Amortization
  const maxMileage = useMemo(() => parseFloat(maxMileageStr) || 0, [maxMileageStr]);
  const currentMileage = useMemo(() => parseFloat(currentMileageStr) || 0, [currentMileageStr]);
  const shoePriceVal = useMemo(() => parseFloat(shoePrice) || 0, [shoePrice]);

  const remShoeLifeKm = useMemo(() => {
    if (maxMileage <= 0) return 0;
    return calculateShoeRemainingKm(maxMileage, currentMileage);
  }, [maxMileage, currentMileage]);

  const shoeUsagePercent = useMemo(() => {
    if (maxMileage <= 0) return 0;
    return calculateShoeUsagePercent(currentMileage, maxMileage);
  }, [currentMileage, maxMileage]);

  const projectedCostPerKm = useMemo(() => {
    if (shoePriceVal <= 0 || maxMileage <= 0) return 0;
    return calculateShoeCostPerKm(shoePriceVal, maxMileage);
  }, [shoePriceVal, maxMileage]);

  const actualAccruedCostPerKm = useMemo(() => {
    if (shoePriceVal <= 0 || currentMileage <= 0) return 0;
    return calculateShoeCostPerKm(shoePriceVal, currentMileage);
  }, [shoePriceVal, currentMileage]);

  const futureMileageAfterRace = useMemo(() => {
    const raceKm = parseFloat(upcomingRaceDist);
    if (isNaN(raceKm) || raceKm <= 0) return 0;
    return calculateRaceShoeAfterEvent(currentMileage, raceKm);
  }, [currentMileage, upcomingRaceDist]);

  const futureRemainingLifeKm = useMemo(() => {
    return maxMileage - futureMileageAfterRace;
  }, [maxMileage, futureMileageAfterRace]);

  // Advanced B: Shoe Head-to-Head Compare Rotation
  const shoeComparisonResults = useMemo(() => {
    const sa = {
      name: shoeAName,
      price: parseFloat(shoeAPrice) || 0,
      currentKm: parseFloat(shoeACurrent) || 0,
      maxKm: parseFloat(shoeAMax) || 0
    };
    const sb = {
      name: shoeBName,
      price: parseFloat(shoeBPrice) || 0,
      currentKm: parseFloat(shoeBCurrent) || 0,
      maxKm: parseFloat(shoeBMax) || 0
    };

    if (sa.maxKm <= 0 || sb.maxKm <= 0) return null;
    return compareShoes(sa, sb);
  }, [shoeAName, shoeAPrice, shoeAMax, shoeACurrent, shoeBName, shoeBPrice, shoeBMax, shoeBCurrent]);

  // Advanced C: Fuel Carbohydrate Economics
  const singleServingMixCost = useMemo(() => {
    const price = parseFloat(mixPackPriceInput);
    const servs = parseFloat(mixServingsInput);
    if (isNaN(price) || isNaN(servs) || servs <= 0) return 0;
    return calculateDrinkMixServingCost(price, servs);
  }, [mixPackPriceInput, mixServingsInput]);

  const gelCostPerCarbGram = useMemo(() => {
    const price = parseFloat(gelCostInput);
    const carbs = parseFloat(gelCarbsInput);
    if (isNaN(price) || isNaN(carbs) || carbs <= 0) return 0;
    return calculateCostPerGramCarb(price, carbs);
  }, [gelCostInput, gelCarbsInput]);

  const mixCostPerCarbGram = useMemo(() => {
    const carbs = parseFloat(mixCarbsPerServing);
    if (isNaN(carbs) || carbs <= 0 || singleServingMixCost <= 0) return 0;
    return calculateCostPerGramCarb(singleServingMixCost, carbs);
  }, [singleServingMixCost, mixCarbsPerServing]);

  const totalSessionFuelCost = useMemo(() => {
    const gc = parseFloat(gelsSessionCount) || 0;
    const gp = parseFloat(gelCostInput) || 0;
    const mc = parseFloat(mixSessionServings) || 0;
    if (isNaN(gc) || isNaN(gp) || isNaN(mc)) return 0;
    
    const gelsSum = calculateGelCost(gc, gp);
    const mixSum = mc * singleServingMixCost;
    return calculateRaceFuelCost(gelsSum, mixSum, 0); // 0 sodium caps
  }, [gelsSessionCount, gelCostInput, mixSessionServings, singleServingMixCost]);

  const totalSessionCarbsGrams = useMemo(() => {
    const gc = parseFloat(gelsSessionCount) || 0;
    const gcarbs = parseFloat(gelCarbsInput) || 0;
    const mc = parseFloat(mixSessionServings) || 0;
    const mcarbs = parseFloat(mixCarbsPerServing) || 0;
    return (gc * gcarbs) + (mc * mcarbs);
  }, [gelsSessionCount, gelCarbsInput, mixSessionServings, mixCarbsPerServing]);

  const sessionCostPerGramBlendedCarb = useMemo(() => {
    if (totalSessionCarbsGrams <= 0 || totalSessionFuelCost <= 0) return 0;
    return totalSessionFuelCost / totalSessionCarbsGrams;
  }, [totalSessionFuelCost, totalSessionCarbsGrams]);


  // Advanced D: Race Kit Checklist Builder
  const kitChecklistArray = useMemo(() => {
    return generateRaceKitChecklist(checklistRaceType, checklistWeather);
  }, [checklistRaceType, checklistWeather]);

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Advanced E: GPS Watch Buffer Safeguard
  const batteryBufferHours = useMemo(() => {
    const battery = parseFloat(watchBatteryLifeHours);
    const expected = parseFloat(expectedRaceCompletionHours);
    if (isNaN(battery) || isNaN(expected) || battery <= 0 || expected <= 0) return 0;
    return calculateWatchBatteryMargin(battery, expected);
  }, [watchBatteryLifeHours, expectedRaceCompletionHours]);


  // --- Recharts Comparative Bar Chart (strictly on calculated states) ---
  const shoeRotationComparisonData = useMemo(() => {
    if (!shoeComparisonResults) return [];
    return [
      {
        name: shoeAName,
        CurrentKm: parseFloat(shoeACurrent) || 0,
        RemainingKm: Math.max(0, shoeComparisonResults.shoeA.remaining),
        ProjectedCostPerKm: Number(shoeComparisonResults.shoeA.costPerKm.toFixed(3)) * 100 // scaled for visible display
      },
      {
        name: shoeBName,
        CurrentKm: parseFloat(shoeBCurrent) || 0,
        RemainingKm: Math.max(0, shoeComparisonResults.shoeB.remaining),
        ProjectedCostPerKm: Number(shoeComparisonResults.shoeB.costPerKm.toFixed(3)) * 100 // scaled
      }
    ];
  }, [shoeComparisonResults, shoeAName, shoeBName, shoeACurrent, shoeBCurrent]);


  // --- Manual Copy / Exports ---
  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    let outputText = '';
    const dateStr = new Date().toISOString().split('T')[0];

    const dataObj = {
      title: "Track.Lab Gear Lifespan & Economics Report",
      date: dateStr,
      metrics: {
        shoeAmortization: {
          originalPrice: `$${shoePrice}`,
          maxMileage: `${maxMileage} km`,
          currentMileage: `${currentMileage} km`,
          remainingLife: `${remShoeLifeKm.toFixed(0)} km`,
          usagePercentage: `${shoeUsagePercent.toFixed(1)}%`,
          projectedCostPerKm: `$${projectedCostPerKm.toFixed(3)}/km`,
          actualCostPerKm: `$${actualAccruedCostPerKm.toFixed(3)}/km`,
          postRaceMileage: `${futureMileageAfterRace.toFixed(1)} km`,
          postRaceRemainingMargin: `${futureRemainingLifeKm.toFixed(1)} km`
        },
        carbEconomics: {
          gelCostPerGram: `$${gelCostPerCarbGram.toFixed(4)}/g`,
          mixCostPerGram: `$${mixCostPerCarbGram.toFixed(4)}/g`,
          totalSessionCost: `$${totalSessionFuelCost.toFixed(2)}`,
          totalSessionCarbs: `${totalSessionCarbsGrams} g`,
          sessionCostPerGramCarb: `$${sessionCostPerGramBlendedCarb.toFixed(4)}/g`
        },
        gpsBatterySafeguard: {
          batteryLifeHours: `${watchBatteryLifeHours} hr`,
          raceTargetFinishHours: `${expectedRaceCompletionHours} hr`,
          bufferMarginHours: `${batteryBufferHours.toFixed(2)} hr`
        }
      },
      traces: {
        shoeRemainingFormula: "MaxKilometers - CurrentKilometers",
        shoeCostKmFormula: "Price / TotalKilometers",
        carbCostGramFormula: "FuelPrice / CarbohydrateGrams",
        batteryBufferFormula: "BatteryLife - EstimatedRaceFinish"
      }
    };

    if (format === 'json') {
      outputText = JSON.stringify(dataObj, null, 2);
    } else if (format === 'csv') {
      outputText = `Wear Subsystem,Metric,Value,Deterministic Trace\n` +
        `Shoe Amortization,Remaining Life,${dataObj.metrics.shoeAmortization.remainingLife},Max - Current\n` +
        `Shoe Amortization,Projected Cost/km,${dataObj.metrics.shoeAmortization.projectedCostPerKm},Price / Max\n` +
        `Shoe Amortization,Actual Cost/km,${dataObj.metrics.shoeAmortization.actualCostPerKm},Price / Current\n` +
        `Fuel Economics,Gel Cost per Carb-g,${dataObj.metrics.carbEconomics.gelCostPerGram},GelPrice / CarbsPerGel\n` +
        `Fuel Economics,Blended Carb Index,${dataObj.metrics.carbEconomics.sessionCostPerGramCarb},SessionPrice / SessionCarbs\n` +
        `Battery Safeguard,Buffer Margin,${dataObj.metrics.gpsBatterySafeguard.bufferMarginHours},BatteryHours - CompletionHours\n`;
    } else {
      outputText = `=========================================\n` +
        `TRACK.LAB GEAR LIFESPAN & METABOLIC FUEL REPORT\n` +
        `=========================================\n\n` +
        `--- SHOE AMORTIZATION & FUTURE MARGINS ---\n` +
        `• Midsole Original Price: ${dataObj.metrics.shoeAmortization.originalPrice}\n` +
        `• Current Mileage Covered: ${dataObj.metrics.shoeAmortization.currentMileage}\n` +
        `• Max Estimated Lifespan: ${dataObj.metrics.shoeAmortization.maxMileage}\n` +
        `• Remaining Wear Budget: ${dataObj.metrics.shoeAmortization.remainingLife} (${dataObj.metrics.shoeAmortization.usagePercentage})\n` +
        `• Projected Amortization Cost/km: ${dataObj.metrics.shoeAmortization.projectedCostPerKm}\n` +
        `• Accrued Life Cost/km: ${dataObj.metrics.shoeAmortization.actualCostPerKm}\n` +
        `• Future Wear (After upcoming event): ${dataObj.metrics.shoeAmortization.postRaceMileage} (Remaining: ${dataObj.metrics.shoeAmortization.postRaceRemainingMargin})\n\n` +
        `--- CARBS ECONOMY & BUDGETS ---\n` +
        `• Gel Cost per carb-gram: ${dataObj.metrics.carbEconomics.gelCostPerGram}\n` +
        `• Mix Cost per carb-gram: ${dataObj.metrics.carbEconomics.mixCostPerGram}\n` +
        `• Planned Carbohydrate Load: ${dataObj.metrics.carbEconomics.totalSessionCarbs}\n` +
        `• Total Fuel Session Expense: ${dataObj.metrics.carbEconomics.totalSessionCost}\n\n` +
        `--- WATCH BATTERY SAFEGUARDS ---\n` +
        `• Clock Spec Battery Life: ${dataObj.metrics.gpsBatterySafeguard.batteryLifeHours}\n` +
        `• Expected Race Completion Time: ${dataObj.metrics.gpsBatterySafeguard.raceTargetFinishHours}\n` +
        `• Safe GPS Battery buffer margin: ${dataObj.metrics.gpsBatterySafeguard.bufferMarginHours}\n\n` +
        `--- DETERMINISTIC FORMULA FOOTNOTES ---\n` +
        `• Wear Remaining: MaxEstimatedKm - CurrentKm\n` +
        `• Shoe Price Amortization: Price / TotalDistance\n` +
        `• Carb Gram Amortization: RetailCost / Carbs(g)\n` +
        `• Watch Buffer: BatteryHrs - FinishTargetHrs\n` +
        `=========================================\n`;
    }

    navigator.clipboard.writeText(outputText).then(() => {
      alert(`Manual results report copied to clipboard as ${format.toUpperCase()}!`);
    }).catch(err => {
      alert("Clipboard access blocked. Copying output text failed.");
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="GEAR LAB" 
        subtitle="Shoe wear price amortization, rotation head-to-head comparators, carbohydrate nutritional financial density, and race day safeguard checklist calculators." 
      />

      {/* Mode Toolbar Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span className="font-semibold text-sm">Operation Framework:</span>
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-1 rounded-md text-xs">
            <button 
              className={`px-3 py-1 rounded transition ${!isAdvanced ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}
              onClick={() => setIsAdvanced(false)}
            >
              Quick Mode
            </button>
            <button 
              className={`px-3 py-1 rounded transition ${isAdvanced ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}
              onClick={() => setIsAdvanced(true)}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleExport('txt')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <Copy className="w-3.5 h-3.5" /> Copy TXT
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <FileText className="w-3.5 h-3.5" /> Copy CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <Sliders className="w-3.5 h-3.5" /> Copy JSON
          </Button>
          <Button variant="outline" onClick={handleReset} className="text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 py-1 px-3 h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Lab
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Calculators inputs (Col size 3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {!isAdvanced ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Quick Shoe life calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Quick Shoe Lifespan Limit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] block mb-1">Price ($)</Label>
                      <Input type="number" value={quickShoePrice} onChange={e => setQuickShoePrice(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[10px] block mb-1">Max Km</Label>
                      <Input type="number" value={quickMaxMileage} onChange={e => setQuickMaxMileage(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[10px] block mb-1">Current Km</Label>
                      <Input type="number" value={quickCurrentMileage} onChange={e => setQuickCurrentMileage(e.target.value)} />
                    </div>
                  </div>

                  {quickRemaining !== 0 && (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-2">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Remaining Estimated Life</div>
                        <div className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                          {quickRemaining.toFixed(0)} <span className="text-xs text-zinc-500 font-normal">km</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Projected shoe cost per km</div>
                        <div className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                          ${quickCostKm.toFixed(3)} <span className="text-xs text-zinc-500 font-normal">/km</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Gels expenditure */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Quick Gels Expense Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gel Retail Price ($)</Label>
                      <Input type="number" step="0.01" value={quickGelsPrice} onChange={e => setQuickGelsPrice(e.target.value)} />
                    </div>
                    <div>
                      <Label>Gels Quantity Needed</Label>
                      <Input type="number" value={quickGelsCount} onChange={e => setQuickGelsCount(e.target.value)} />
                    </div>
                  </div>

                  {quickFuelCostValue > 0 && (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Estimated Gels Session Expense</div>
                      <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        ${quickFuelCostValue.toFixed(2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            
            // --- Advanced subtabs switcher menu ---
            <div className="space-y-6">
              
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm overflow-x-auto whitespace-nowrap">
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'shoe_amort' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('shoe_amort')}
                >
                  Shoe Wear Amortization
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'rotation_compare' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('rotation_compare')}
                >
                  Rotation Compare
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'carb_economics' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('carb_economics')}
                >
                  Carb Economics
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'race_checklist' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('race_checklist')}
                >
                  Race Checklist
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'battery_buffer' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('battery_buffer')}
                >
                  GPS Battery safeguard
                </button>
              </div>

              {activeTab === 'shoe_amort' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Shoe lifespan wear & Price Amortization</CardTitle>
                    <CardDescription>
                      Tracks estimated physical mileage depletion budgets and calculates compound distance amortization metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Shoe Purchase Price ($)</Label>
                        <Input type="number" step="0.01" value={shoePrice} onChange={e => setShoePrice(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Est. Manufacturer Span (km)</Label>
                        <Input type="number" value={maxMileageStr} onChange={e => setMaxMileageStr(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Accumulated (km)</Label>
                        <Input type="number" value={currentMileageStr} onChange={e => setCurrentMileageStr(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Upcoming target race distance (km)</Label>
                        <Input type="number" step="0.1" value={upcomingRaceDist} onChange={e => setUpcomingRaceDist(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Remaining Wear Budget</span>
                        <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-zinc-50 block mt-1">
                          {remShoeLifeKm.toFixed(0)} <span className="text-xs font-normal">km remaining</span>
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          Usage exhaustion: {shoeUsagePercent.toFixed(1)}%
                        </span>
                        {remShoeLifeKm < 100 && (
                          <div className="mt-2 text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> High mileage caution limit
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Sinking Amortization index</span>
                        <div className="space-y-1 block mt-1">
                          <span className="text-base font-bold font-mono block">
                            Projected: <span className="text-zinc-950 dark:text-zinc-50">${projectedCostPerKm.toFixed(3)}/km</span>
                          </span>
                          <span className="text-base font-bold font-mono block">
                            Accrued to date: <span className="text-zinc-900 dark:text-zinc-100">${actualAccruedCostPerKm.toFixed(3)}/km</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md flex flex-col justify-between">
                        <div>
                          <span className="text-xs text-zinc-400 font-mono uppercase block">Post-race estimated condition</span>
                          <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block mt-1">
                            Mileage: {futureMileageAfterRace.toFixed(0)} km
                          </span>
                        </div>
                        <span className={`text-xs block font-mono mt-1 ${futureRemainingLifeKm < 50 ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                          Post-race budget: {futureRemainingLifeKm.toFixed(0)} km margin
                        </span>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'rotation_compare' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Rotation Head-To-Head Compare</CardTitle>
                    <CardDescription>
                      Insert distinct model statistics side-by-side to determine which shoe in your kit rotation has higher remaining value or lower cost density.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Shoe A Profile */}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <div className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Shoe A Profile configuration</div>
                        <div className="space-y-2">
                          <Label>Label Name</Label>
                          <Input type="text" value={shoeAName} onChange={e => setShoeAName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px] block mb-1">Price ($)</Label>
                            <Input type="number" value={shoeAPrice} onChange={e => setShoeAPrice(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Max Km</Label>
                            <Input type="number" value={shoeAMax} onChange={e => setShoeAMax(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Current Km</Label>
                            <Input type="number" value={shoeACurrent} onChange={e => setShoeACurrent(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      {/* Shoe B Profile */}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <div className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Shoe B Profile configuration</div>
                        <div className="space-y-2">
                          <Label>Label Name</Label>
                          <Input type="text" value={shoeBName} onChange={e => setShoeBName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px] block mb-1">Price ($)</Label>
                            <Input type="number" value={shoeBPrice} onChange={e => setShoeBPrice(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Max Km</Label>
                            <Input type="number" value={shoeBMax} onChange={e => setShoeBMax(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Current Km</Label>
                            <Input type="number" value={shoeBCurrent} onChange={e => setShoeBCurrent(e.target.value)} />
                          </div>
                        </div>
                      </div>

                    </div>

                    {shoeComparisonResults && (
                      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="font-semibold text-xs uppercase tracking-wider">Comparison Mathematical Delta Analysis</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-md">
                            <span className="text-[11px] font-mono text-zinc-400 block uppercase">Lifespan Margin Gap</span>
                            <span className="text-xl font-bold font-mono">
                              {shoeComparisonResults.remainingKmDelta > 0 ? `${shoeAName} has ` : `${shoeBName} has `} 
                              {Math.abs(shoeComparisonResults.remainingKmDelta).toFixed(0)} km more limit
                            </span>
                          </div>

                          <div className="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-md">
                            <span className="text-[11px] font-mono text-zinc-400 block uppercase">Amortization Cost Gap</span>
                            <span className="text-xl font-bold font-mono">
                              {shoeComparisonResults.costPerKmDelta < 0 ? `${shoeAName}` : `${shoeBName}`} is cheaper by 
                              ${Math.abs(shoeComparisonResults.costPerKmDelta).toFixed(3)}/km
                            </span>
                          </div>

                          <div className="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-md">
                            <span className="text-[11px] font-mono text-zinc-400 block uppercase">Relative wear contrast</span>
                            <span className="text-xl font-bold font-mono">
                              Delta shift of {Math.abs(shoeComparisonResults.usagePctDelta).toFixed(1)}% usage
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'carb_economics' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Carbohydrate Fueling Economics</CardTitle>
                    <CardDescription>
                      Assess raw financial carbohydrate density across brands to optimize metabolic fuel spend allocations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Gel calculations */}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Subsystem A: Gels Density</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Retail Price per Gel ($)</Label>
                            <Input type="number" step="0.01" value={gelCostInput} onChange={e => setGelCostInput(e.target.value)} />
                          </div>
                          <div>
                            <Label>Carb Content per Gel (g)</Label>
                            <Input type="number" value={gelCarbsInput} onChange={e => setGelCarbsInput(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1 pt-2">
                          <Label>Quantity Planned</Label>
                          <Input type="number" value={gelsSessionCount} onChange={e => setGelsSessionCount(e.target.value)} />
                        </div>

                        {gelCostPerCarbGram > 0 && (
                          <div className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono">
                            Cost-per-gram: <span className="font-bold text-zinc-950 dark:text-zinc-50">${gelCostPerCarbGram.toFixed(4)} / gram carb</span>
                          </div>
                        )}
                      </div>

                      {/* Drink mixes calculations */}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Subsystem B: Powder Drink Mix</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Tub Price ($)</Label>
                            <Input type="number" step="0.01" value={mixPackPriceInput} onChange={e => setMixPackPriceInput(e.target.value)} />
                          </div>
                          <div>
                            <Label>Total Servs</Label>
                            <Input type="number" value={mixServingsInput} onChange={e => setMixServingsInput(e.target.value)} />
                          </div>
                          <div>
                            <Label>Carbs/Serv (g)</Label>
                            <Input type="number" value={mixCarbsPerServing} onChange={e => setMixCarbsPerServing(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1 pt-2">
                          <Label>Active Servings Planned</Label>
                          <Input type="number" value={mixSessionServings} onChange={e => setMixSessionServings(e.target.value)} />
                        </div>

                        {mixCostPerCarbGram > 0 && (
                          <div className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono space-y-1">
                            <div>Cost-per-serving: <span className="font-bold text-zinc-950 dark:text-zinc-50">${singleServingMixCost.toFixed(2)}</span></div>
                            <div>Cost-per-gram: <span className="font-bold text-zinc-900 dark:text-zinc-100">${mixCostPerCarbGram.toFixed(4)} / gram carb</span></div>
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500 uppercase font-mono block">Planned Fuel Session Totals</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <span className="text-xs text-zinc-600 block">Total Carbohydrates:</span>
                          <span className="text-xl font-bold font-mono">{totalSessionCarbsGrams} grams carbs</span>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-600 block">Total Financial Cost:</span>
                          <span className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">${totalSessionFuelCost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-600 block">Amortized Blended Index:</span>
                          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">${sessionCostPerGramBlendedCarb.toFixed(4)} / g carb</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'race_checklist' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Interactive Race Kit Checklist Generator</CardTitle>
                    <CardDescription>
                      Dynamically configure checklists based on targeted race lengths and environmental variables. Note that this requires complete manual checkout execution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Race Type Anchor</Label>
                        <Select value={checklistRaceType} onChange={e => setChecklistRaceType(e.target.value)}>
                          <option value="race_5k_10k">5K or 10K short event spacing</option>
                          <option value="race_half_marathon">Half Marathon distance</option>
                          <option value="race_marathon">Marathon distance limits</option>
                          <option value="race_track_segment">Track Spike specific pacing</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Weather Tag</Label>
                        <Select value={checklistWeather} onChange={e => setChecklistWeather(e.target.value)}>
                          <option value="weather_cold">Cold / Chilly environment</option>
                          <option value="weather_warm">Warm / Muggy / UV Heat</option>
                          <option value="weather_rainy">Rainy / Slippery damp conditions</option>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Kit Packing Checklist</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {kitChecklistArray.map(item => (
                          <div 
                            key={item} 
                            className={`p-2 border rounded-md flex items-center justify-between cursor-pointer transition ${checkedItems[item] ? 'bg-zinc-50 border-zinc-300 line-through text-zinc-400' : 'bg-transparent border-zinc-200 hover:bg-zinc-50'}`}
                            onClick={() => toggleCheckItem(item)}
                          >
                            <span className="text-xs font-sans font-medium">{item}</span>
                            <input 
                              type="checkbox" 
                              checked={!!checkedItems[item]} 
                              onChange={() => {}} // toggled by row click
                              className="w-3.5 h-3.5 rounded border-zinc-300 accent-zinc-950 focus:ring-zinc-950"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'battery_buffer' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Watch GPS Battery buffer safeguard</CardTitle>
                    <CardDescription>
                      Compare nominal factory tracking limits to targeted run final times to avoid tracklog failures.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="watchBatteryLifeHours">Manufacturer GPS Battery life (hr)</Label>
                        <Input 
                          id="watchBatteryLifeHours" 
                          type="number" 
                          value={watchBatteryLifeHours} 
                          onChange={e => setWatchBatteryLifeHours(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedRaceCompletionHours">Expected Target Finish Duration (hr)</Label>
                        <Input 
                          id="expectedRaceCompletionHours" 
                          type="number" 
                          step="0.1" 
                          value={expectedRaceCompletionHours} 
                          onChange={e => setExpectedRaceCompletionHours(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
                      <span className="text-xs text-zinc-500 uppercase font-mono block">Calculated Battery Buffer margin</span>
                      
                      {batteryBufferHours > 0 ? (
                        <>
                          <div className={`text-3xl font-extrabold font-mono ${batteryBufferHours < 2 ? 'text-amber-500' : 'text-zinc-950 dark:text-zinc-50'}`}>
                            +{batteryBufferHours.toFixed(1)} <span className="text-xs font-normal">hours safe margin</span>
                          </div>
                          
                          {batteryBufferHours < 2 && (
                            <div className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Warning: Low buffer reserve limit (less than 2 hours margin)
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-red-600 block text-sm font-semibold uppercase leading-tight font-mono">
                          ❌ Watch battery estimated death before finish event boundary! Increase sample interval rate to ultra-saving modes.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Core bar charts rendered on real comparison variables */}
          {isAdvanced && shoeRotationComparisonData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Active Shoe Rotation Condition Metric Comparisons</CardTitle>
                <CardDescription>
                  Contrasts current accumulated mileage against safe limits, plus amortized projection indices ($ per km x 100 scaled) side-by-side.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shoeRotationComparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                      <YAxis stroke="#18181b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar dataKey="CurrentKm" name="Current Mileage Covered (km)" fill="#18181b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="RemainingKm" name="Remaining Wear Budget (km)" fill="#71717a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ProjectedCostPerKm" name="Projected Cost Index (Scaled W-Value)" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right educational footnotes side column */}
        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Methodology Footnotes & Source Trace</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Wear Remainder</div>
                <p>Formula: Max_Km - Current_Km</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  A basic subtraction calculation representing general wear status limits based on factory recommendations.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Amortization indexing</div>
                <p>Formula: Price / Lifespan_Distance</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Evaluates distance amortization. Low cost index per kilometer represents massive financial shoes efficiency.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Carb Gram density</div>
                <p>Formula: Cost / Carbs_Grams</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Measures chemical carburetor expense efficiency. Bulk powders offer higher carb density compared to gels.
                </p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 rounded-md text-[10px]">
                <span className="font-bold block uppercase mb-1">LIMITATIONS NOTE:</span>
                Calculations are mathematical only. Track.Lab does NOT assess actual physical shoe condition, midsole compaction metrics, or make rigid shoe replacements suggestions. Note that wear relies on runners weight.
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
