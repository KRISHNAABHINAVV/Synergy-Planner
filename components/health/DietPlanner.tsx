
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { PlusIcon, TrashIcon, CameraIcon, CheckIcon, ChevronRightIcon } from '../Icons';
import Loader from '../ui/Loader';
import { api } from '../../services/api';

interface DietItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string; // e.g., 'Breakfast', 'Snack', 'Manual', 'Log'
}

// Helper function to resize and compress image before sending to AI
const resizeImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG at 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl.split(',')[1]);
                } else {
                    reject(new Error("Could not get canvas context"));
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const DietPlanner: React.FC = () => {
    const [dietItems, setDietItems] = useState<DietItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modes: 'ai' for Calculator/Scanner, 'manual' for manual entry
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');
    
    // AI State
    const [query, setQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanResult, setScanResult] = useState<DietItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Form State
    const [manualForm, setManualForm] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });

    // Initialize sample data
    useEffect(() => {
        const loadDietItems = async () => {
            try {
                setIsLoading(true);
                const items = await api.getDietItems();
                setDietItems(items);
            } catch (error) {
                console.error('Failed to load diet items:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDietItems();
    }, []);

    // --- AI HANDLERS ---

    const handleAnalyzeText = async () => {
        if (!query.trim()) return;
        setIsAnalyzing(true);
        setScanResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                Identify nutritional info for: "${query}". 
                Return a JSON object with keys: name, calories, protein, carbs, fat.
                Rules: 
                1. Estimate values for a standard serving size if not specified.
                2. Use integer values.
                3. Ensure values are not 0 unless the food actually has 0 (like water).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            calories: { type: Type.INTEGER },
                            protein: { type: Type.INTEGER },
                            carbs: { type: Type.INTEGER },
                            fat: { type: Type.INTEGER },
                        },
                        required: ["name", "calories", "protein", "carbs", "fat"]
                    }
                }
            });

            const result = JSON.parse(response.text);
            setScanResult({
                id: Date.now(),
                name: result.name || query,
                calories: Math.round(result.calories || 0),
                protein: Math.round(result.protein || 0),
                carbs: Math.round(result.carbs || 0),
                fat: Math.round(result.fat || 0),
                time: "AI Calc"
            });
        } catch (error) {
            console.error("Error analyzing text:", error);
            alert("Could not analyze food. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setScanResult(null);
        
        try {
            const base64Image = await resizeImage(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const imagePart = {
                inlineData: { mimeType: 'image/jpeg', data: base64Image },
            };
            const textPart = {
                text: `Identify the main food in this image. 
                       Return a JSON object with keys: name, calories, protein, carbs, fat.
                       Rules: Estimate exact values for the visible portion. Use rounded integers.`
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            calories: { type: Type.INTEGER },
                            protein: { type: Type.INTEGER },
                            carbs: { type: Type.INTEGER },
                            fat: { type: Type.INTEGER },
                        },
                        required: ["name", "calories", "protein", "carbs", "fat"]
                    }
                }
            });

            const result = JSON.parse(response.text);
            setScanResult({
                id: Date.now(),
                name: result.name || "Scanned Food",
                calories: Math.round(result.calories || 0),
                protein: Math.round(result.protein || 0),
                carbs: Math.round(result.carbs || 0),
                fat: Math.round(result.fat || 0),
                time: "AI Scan"
            });
        } catch (err) {
            console.error("Error analyzing image:", err);
            alert("Could not analyze image.");
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addScanToLog = async () => {
        if (scanResult) {
            try {
                const newItem = await api.createDietItem({
                    ...scanResult,
                    date: new Date().toISOString()
                });
                setDietItems(prev => [newItem, ...prev]);
                setScanResult(null);
                setQuery("");
            } catch (error) {
                console.error('Failed to add diet item:', error);
                alert('Failed to add item. Please try again.');
            }
        }
    };

    // --- MANUAL HANDLERS ---

    const handleManualSubmit = async () => {
        if (!manualForm.name.trim() || !manualForm.calories) {
            return; // Basic validation
        }

        try {
            const newItem = await api.createDietItem({
                name: manualForm.name,
                calories: parseInt(manualForm.calories) || 0,
                protein: parseInt(manualForm.protein) || 0,
                carbs: parseInt(manualForm.carbs) || 0,
                fat: parseInt(manualForm.fat) || 0,
                time: "Manual",
                date: new Date().toISOString()
            });

            setDietItems(prev => [newItem, ...prev]);
            setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
        } catch (error) {
            console.error('Failed to create diet item:', error);
            alert('Failed to add item. Please try again.');
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await api.deleteDietItem(id);
            setDietItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Failed to delete diet item:', error);
        }
    };

    // --- CALCULATIONS ---
    const totalCalories = Math.round(dietItems.reduce((acc, item) => acc + item.calories, 0));
    const totalProtein = Math.round(dietItems.reduce((acc, item) => acc + item.protein, 0));
    const totalCarbs = Math.round(dietItems.reduce((acc, item) => acc + item.carbs, 0));
    const totalFat = Math.round(dietItems.reduce((acc, item) => acc + item.fat, 0));

    return (
        <div className="bg-white dark:bg-black min-h-[600px] flex flex-col rounded-t-[3rem] overflow-hidden -mx-4 sm:mx-0 relative">
            
            {/* Top Section: Calculator Controls */}
            <div className="bg-black dark:bg-white/5 text-white p-6 pb-12">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add Nutrition</h2>
                    <div className="flex bg-white/10 p-1 rounded-lg">
                        <button 
                            onClick={() => setMode('ai')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${mode === 'ai' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            AI Calc
                        </button>
                        <button 
                            onClick={() => setMode('manual')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${mode === 'manual' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Manual
                        </button>
                    </div>
                </div>
                
                {mode === 'ai' ? (
                    <div className="animate-fade-in">
                        {/* Text Input Search */}
                        <div className="relative mb-6">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
                                placeholder="Type food (e.g. 1 Banana)..."
                                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white/20 transition-all"
                            />
                            <button 
                                onClick={handleAnalyzeText}
                                disabled={isAnalyzing}
                                className="absolute right-2 top-2 p-1.5 bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                <ChevronRightIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-xs text-gray-500 font-bold uppercase">OR</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="w-full py-3 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all group active:scale-95"
                        >
                            <CameraIcon className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-gray-200">Scan Food with Camera</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAnalyzeImage} 
                            className="hidden" 
                            accept="image/*"
                            capture="environment"
                        />
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-4">
                        {/* Manual Entry Form */}
                        <div>
                            <label className="text-xs text-gray-400 ml-2">Food Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Greek Yogurt"
                                value={manualForm.name}
                                onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 ml-2">kcal</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={manualForm.calories}
                                    onChange={(e) => setManualForm({...manualForm, calories: e.target.value})}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 ml-2">Prot (g)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={manualForm.protein}
                                    onChange={(e) => setManualForm({...manualForm, protein: e.target.value})}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 ml-2">Carbs (g)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={manualForm.carbs}
                                    onChange={(e) => setManualForm({...manualForm, carbs: e.target.value})}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 ml-2">Fat (g)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={manualForm.fat}
                                    onChange={(e) => setManualForm({...manualForm, fat: e.target.value})}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleManualSubmit}
                            className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg transition-all"
                        >
                            Add Item
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Section: Results & Log */}
            <div className="flex-grow bg-white dark:bg-gray-900 rounded-tl-[3rem] -mt-8 relative px-6 pt-10 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                
                {/* Loading State Overlay */}
                {isAnalyzing && (
                     <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center justify-center pt-10 animate-fade-in">
                        <Loader />
                        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Analyzing nutritional data...</p>
                     </div>
                )}

                {/* Analysis Result Card (Only for AI Mode results) */}
                {scanResult && !isAnalyzing && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-500/30 p-5 rounded-3xl mb-8 animate-slide-down shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{scanResult.name}</h3>
                                <p className="text-sm text-orange-600 dark:text-orange-400 font-bold mt-1">{scanResult.calories} kcal</p>
                            </div>
                            <button onClick={() => setScanResult(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-white dark:bg-black/40 p-3 rounded-2xl text-center shadow-sm">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Protein</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{scanResult.protein}g</p>
                            </div>
                            <div className="bg-white dark:bg-black/40 p-3 rounded-2xl text-center shadow-sm">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Carbs</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{scanResult.carbs}g</p>
                            </div>
                            <div className="bg-white dark:bg-black/40 p-3 rounded-2xl text-center shadow-sm">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Fat</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{scanResult.fat}g</p>
                            </div>
                        </div>

                        <button 
                            onClick={addScanToLog}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add to Daily Log
                        </button>
                    </div>
                )}

                {/* Daily Summary */}
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-black dark:text-white">Daily Log</h3>
                     <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">Today</span>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 flex justify-between text-center border border-gray-100 dark:border-white/5 mb-6">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">kcal</p>
                        <p className="text-lg font-bold text-orange-500">{totalCalories}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Prot</p>
                        <p className="text-lg font-bold text-blue-500">{totalProtein}g</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Carbs</p>
                        <p className="text-lg font-bold text-purple-500">{totalCarbs}g</p>
                    </div>
                        <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Fat</p>
                        <p className="text-lg font-bold text-yellow-500">{totalFat}g</p>
                    </div>
                </div>

                {/* Food List */}
                <div className="space-y-3 pb-8">
                     {dietItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 dark:bg-white/5 dark:border-white/5 hover:shadow-md transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white capitalize">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded text-[10px]">{item.time}</span>
                                    <p className="text-xs text-gray-500">
                                        {item.calories} kcal • {item.protein}p • {item.carbs}c • {item.fat}f
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {dietItems.length === 0 && (
                        <div className="text-center text-gray-400 py-6">
                            <p>No food logged yet.</p>
                            <p className="text-sm opacity-60 mt-1">Use AI Calc or Manual entry to add items.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DietPlanner;
