
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { PlusIcon, MoreHorizontalIcon, CheckIcon, TrashIcon } from '../Icons';
import Loader from '../ui/Loader';
import { api } from '../../services/api';

interface Exercise {
  id: number;
  name: string;
  details: string;
  time: string;
  completed: boolean;
  isAiGenerated?: boolean;
  date: string; // YYYY-MM-DD format
}

const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const WorkoutPlanner: React.FC = () => {
    const [view, setView] = useState<'list' | 'generate'>('list');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [weekDates, setWeekDates] = useState<Date[]>([]);
    
    // Initial sample data populated for the current week
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Manual Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: '', details: '', time: '' });
    
    const [goal, setGoal] = useState("");

    // Initialize dates and sample data
    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            dates.push(d);
        }
        setWeekDates(dates);
        
        // Load exercises from backend
        const loadExercises = async () => {
            try {
                setIsLoading(true);
                const fetchedExercises = await api.getExercises();
                setExercises(fetchedExercises);
            } catch (error) {
                console.error('Failed to load exercises:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadExercises();
    }, []);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // Current day context
            const todayDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            
            const prompt = `
                Generate a workout routine based on the user's goal: "${goal}".
                Context: The plan should start from today (${todayDayName}).
                
                IMPORTANT:
                - If the user asks for a "7 day plan", "weekly split", or implies multiple days (e.g. "push pull legs"), generate a schedule for 7 days (dayOffset 0 to 6).
                - If the user asks for a single workout, generate only for dayOffset 0.
                - "dayOffset" 0 is the starting day (today), 1 is tomorrow, etc.
                
                Return a JSON object with this structure:
                {
                  "schedule": [
                    {
                      "dayOffset": number,
                      "exercises": [
                        { "name": "string", "details": "string", "time": "string" }
                      ]
                    }
                  ]
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            schedule: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        dayOffset: { type: Type.NUMBER },
                                        exercises: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    name: { type: Type.STRING },
                                                    details: { type: Type.STRING },
                                                    time: { type: Type.STRING }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            const result = JSON.parse(response.text);
            
            if (result.schedule && Array.isArray(result.schedule)) {
                const newExercises: Omit<Exercise, 'id'>[] = [];
                const baseDate = new Date(selectedDate); // Start plan from currently selected date

                result.schedule.forEach((dayPlan: any) => {
                    const planDate = new Date(baseDate);
                    planDate.setDate(baseDate.getDate() + (dayPlan.dayOffset || 0));
                    const dateStr = toDateKey(planDate);

                    dayPlan.exercises.forEach((ex: any) => {
                        newExercises.push({
                            name: ex.name,
                            details: ex.details,
                            time: ex.time || "Anytime",
                            completed: false,
                            isAiGenerated: true,
                            date: dateStr
                        });
                    });
                });

                try {
                    const created = await api.bulkCreateExercises(newExercises);
                    setExercises(prev => [...prev, ...created]);
                    setView('list');
                    setGoal("");
                } catch (error) {
                    console.error('Failed to save exercises:', error);
                    alert('Failed to save exercises. Please try again.');
                }
            }
        } catch (error) {
            console.error("Error generating workout:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddManualExercise = async () => {
        if (!newExercise.name.trim()) return;

        try {
            const manualExercise = await api.createExercise({
                name: newExercise.name,
                details: newExercise.details || "Custom",
                time: newExercise.time || "Anytime",
                completed: false,
                date: toDateKey(selectedDate),
                isAiGenerated: false
            });

            setExercises(prev => [...prev, manualExercise]);
            setNewExercise({ name: '', details: '', time: '' });
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to create exercise:', error);
            alert('Failed to create exercise. Please try again.');
        }
    };

    const handleDeleteExercise = async (id: number) => {
        try {
            await api.deleteExercise(id);
            setExercises(prev => prev.filter(ex => ex.id !== id));
        } catch (error) {
            console.error('Failed to delete exercise:', error);
        }
    };

    const toggleComplete = async (id: number) => {
        const exercise = exercises.find(ex => ex.id === id);
        if (!exercise) return;
        
        try {
            const updated = await api.updateExercise(id, { completed: !exercise.completed });
            setExercises(prev => prev.map(ex => ex.id === id ? updated : ex));
        } catch (error) {
            console.error('Failed to update exercise:', error);
        }
    };

    const currentSelectedDateKey = toDateKey(selectedDate);
    const filteredExercises = exercises.filter(ex => ex.date === currentSelectedDateKey);

    return (
        <div className="bg-white dark:bg-black min-h-[600px] flex flex-col rounded-t-[3rem] overflow-hidden -mx-4 sm:mx-0 relative">
            
            {/* Top Section: Black Background */}
            <div className="bg-black dark:bg-white/5 text-white p-8 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">
                        {selectedDate.toLocaleString('default', { month: 'long' })}
                    </h2>
                    <button 
                        onClick={() => setView(view === 'list' ? 'generate' : 'list')}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        title="Generate AI Plan"
                    >
                        {view === 'list' ? 'AI' : <CheckIcon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Calendar Strip (7 Days) */}
                <div className="flex justify-between items-center">
                    {weekDates.map((date) => {
                        const isSelected = toDateKey(date) === currentSelectedDateKey;
                        const dayNum = date.getDate();
                        const dayName = ['S','M','T','W','T','F','S'][date.getDay()];
                        
                        return (
                            <button 
                                key={date.toISOString()} 
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center gap-2 transition-all ${isSelected ? 'transform scale-110' : 'opacity-50 hover:opacity-80'}`}
                            >
                                <span className="text-xs font-medium text-gray-400">
                                    {dayName}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-orange-500 text-white' : 'text-white'}`}>
                                    {dayNum}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Section: White Background with Curve */}
            <div className="flex-grow bg-white dark:bg-gray-900 rounded-tl-[3rem] -mt-8 relative px-8 pt-10 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                        {view === 'generate' ? 'New Plan' : 'Workouts'}
                    </h3>
                    
                    {view === 'list' && (
                        <div className="flex items-center gap-2">
                             <div className="text-sm text-gray-400 font-medium mr-2">
                                {selectedDate.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}
                            </div>
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${isAdding ? 'bg-red-500 text-white rotate-45' : 'bg-gray-100 dark:bg-white/10 text-black dark:text-white hover:bg-gray-200'}`}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {view === 'generate' ? (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Goal / Focus</label>
                            <textarea 
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g. 7 day push pull legs split with rest on Sunday..."
                                className="w-full h-32 bg-gray-100 dark:bg-black/20 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-800 dark:text-white"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Tip: You can ask for a weekly plan, specific splits, or a single workout.
                            </p>
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader /> : 'Generate Plan'}
                        </button>
                        <button onClick={() => setView('list')} className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600">Cancel</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Manual Add Form */}
                        {isAdding && (
                            <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl animate-fade-in border border-gray-100 dark:border-white/5">
                                <h4 className="text-sm font-bold text-gray-500 mb-3">Add Exercise</h4>
                                <input
                                    type="text"
                                    placeholder="Exercise Name (e.g. Squats)"
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 mb-3 focus:outline-none focus:border-orange-500 text-black dark:text-white"
                                    value={newExercise.name}
                                    onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                    autoFocus
                                />
                                <div className="flex gap-3 mb-4">
                                     <input
                                        type="text"
                                        placeholder="Sets/Reps (e.g. 3x10)"
                                        className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 focus:outline-none focus:border-orange-500 text-black dark:text-white"
                                        value={newExercise.details}
                                        onChange={e => setNewExercise({...newExercise, details: e.target.value})}
                                    />
                                     <input
                                        type="text"
                                        placeholder="Time"
                                        className="w-24 bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 focus:outline-none focus:border-orange-500 text-black dark:text-white"
                                        value={newExercise.time}
                                        onChange={e => setNewExercise({...newExercise, time: e.target.value})}
                                    />
                                </div>
                                <button onClick={handleAddManualExercise} className="w-full bg-orange-500 text-white py-2 rounded-xl font-bold text-sm shadow-md hover:bg-orange-600 transition-colors">
                                    Add to {selectedDate.toLocaleDateString('default', { weekday: 'short' })}
                                </button>
                            </div>
                        )}

                        {filteredExercises.length > 0 ? (
                            filteredExercises.map((ex, index) => (
                                <div 
                                    key={ex.id} 
                                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${ex.completed ? 'opacity-50' : ''}`}
                                    onClick={() => toggleComplete(ex.id)}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-colors ${ex.completed ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
                                        {ex.completed ? <CheckIcon className="w-6 h-6" /> : (index + 1)}
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <h4 className={`font-bold text-lg ${ex.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{ex.name}</h4>
                                        <p className="text-sm text-gray-500">{ex.details}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-bold text-gray-300">{ex.time}</span>
                                        <div className="flex gap-2 items-center">
                                            {ex.isAiGenerated && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="AI Generated"></span>}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteExercise(ex.id); }}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Exercise"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !isAdding && (
                                <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                                    <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
                                        <PlusIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="font-medium">Rest day?</p>
                                    <p className="text-sm opacity-60">No workouts scheduled for this date.</p>
                                    <button onClick={() => setView('generate')} className="text-orange-500 font-bold mt-4 text-sm hover:underline">
                                        Generate Plan
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutPlanner;
