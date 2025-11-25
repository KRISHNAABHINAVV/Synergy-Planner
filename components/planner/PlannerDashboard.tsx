
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, CheckIcon, TrashIcon } from '../Icons';
import { Todo } from '../../types';
import { api } from '../../services/api';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Generate random streak data for the heatmap (10 weeks * 7 days)
const generateStreakData = () => {
    return Array.from({ length: 70 }).map(() => Math.random());
};

const PlannerDashboard: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
    
    // Task State
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskText, setNewTaskText] = useState("");
    
    // Streak State
    const [streakData, setStreakData] = useState<number[]>([]);

    // Load todos from backend
    useEffect(() => {
        const loadTodos = async () => {
            try {
                setIsLoading(true);
                const fetchedTodos = await api.getTodos();
                // Convert date strings to Date objects
                const todosWithDates = fetchedTodos.map(todo => ({
                    ...todo,
                    date: new Date(todo.date)
                }));
                setTodos(todosWithDates);
            } catch (error) {
                console.error('Failed to load todos:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTodos();
    }, []);

    useEffect(() => {
        setStreakData(generateStreakData());
    }, []);

    const todayStreakIndex = streakData.length - 1;
    
    // Calculate today's intensity based on completed tasks
    const todaysTasks = todos.filter(t => 
        t.date.getDate() === new Date().getDate() && 
        t.date.getMonth() === new Date().getMonth()
    );
    const completionRate = todaysTasks.length > 0 
        ? todaysTasks.filter(t => t.completed).length / todaysTasks.length 
        : 0;

    // Calendar Helpers
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const getDaysArray = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const handleMonthClick = (index: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(index);
        setCurrentDate(newDate);
    };

    const toggleTaskCompletion = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        try {
            const updated = await api.updateTodo(id, { completed: !todo.completed });
            setTodos(prev => prev.map(t => t.id === id ? { ...updated, date: new Date(updated.date) } : t));
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const addNewTask = async () => {
        if (newTaskText.trim()) {
            try {
                const newTask = await api.createTodo({
                    text: newTaskText,
                    completed: false,
                    description: "New task",
                    date: selectedDate.toISOString(),
                    time: "Anytime",
                    type: 'task'
                });
                setTodos([...todos, { ...newTask, date: new Date(newTask.date) }]);
                setNewTaskText("");
                setIsAdding(false);
            } catch (error) {
                console.error('Failed to create todo:', error);
                alert('Failed to create task. Please try again.');
            }
        }
    };

    const filteredTodos = todos.filter(todo => 
        todo.date.getDate() === selectedDate.getDate() &&
        todo.date.getMonth() === selectedDate.getMonth() &&
        todo.date.getFullYear() === selectedDate.getFullYear()
    );

    // Render Calendar Grid or Strip
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = getDaysArray();
        const startDay = firstDayOfMonth(year, month);
        
        if (isCalendarExpanded) {
            const blanks = Array(startDay).fill(null);
            return (
                <div className="grid grid-cols-7 gap-2 text-center animate-fade-in">
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-xs text-gray-400 font-bold mb-2">{d}</div>
                    ))}
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(day => {
                        const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
                        const isToday = new Date().getDate() === day && new Date().getMonth() === month;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(year, month, day))}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all
                                ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                                ${!isSelected && isToday ? 'border border-orange-500 text-orange-500' : ''}
                                `}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            );
        } else {
            // Show a strip centered around selected date or start of month
            // For simplicity, showing first 7 days or logic to scroll could be added. 
            // Here we show a slice based on selected date to keep context.
            let startSlice = selectedDate.getDate() - 3;
            if (startSlice < 1) startSlice = 1;
            const endSlice = Math.min(startSlice + 6, days.length);
            const daysSlice = days.slice(startSlice - 1, endSlice);

            return (
                 <div className="flex justify-between items-center px-2">
                    {daysSlice.map(day => {
                        const dateObj = new Date(year, month, day);
                        const dayName = ['S','M','T','W','T','F','S'][dateObj.getDay()];
                        const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
                        
                        return (
                            <div key={day} className="flex flex-col items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">{dayName}</span>
                                <button 
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`w-12 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300
                                    ${isSelected 
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl scale-110' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col">
            
            {/* Top Section: White Background */}
            <div className="bg-white dark:bg-black text-black dark:text-white px-6 pt-4 pb-6 transition-all duration-500 ease-in-out">
                {/* Header with Year */}
                <div className="flex justify-between items-center mb-6">
                    <button className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-widest uppercase text-gray-900 dark:text-white">
                        {currentDate.getFullYear()}
                    </h1>
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>

                {/* Scrollable Month List */}
                <div className="flex overflow-x-auto gap-8 pb-4 mb-2 scrollbar-hide snap-x">
                    {months.map((m, index) => (
                        <button 
                            key={m}
                            onClick={() => handleMonthClick(index)}
                            className={`text-2xl font-bold whitespace-nowrap transition-colors snap-center
                            ${currentDate.getMonth() === index ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Calendar Area */}
                <div className="mb-2 min-h-[100px]">
                    {renderCalendar()}
                </div>

                {/* Expand/Collapse Toggle */}
                <div className="flex justify-center">
                    <button 
                        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"
                    >
                        {isCalendarExpanded ? (
                            <div className="flex flex-col items-center text-xs font-medium gap-1">
                                <ChevronUpIcon className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-xs font-medium gap-1">
                                <span className="opacity-0 hover:opacity-100 transition-opacity">View Month</span>
                                <ChevronDownIcon className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Section: Black Curved Container */}
            <div className="flex-grow bg-black dark:bg-white/5 text-white dark:text-gray-200 rounded-tl-[3rem] px-8 pt-8 pb-24 relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
                
                {/* Streak Heatmap */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consistency Streak</h3>
                         <span className="text-xs text-orange-500">{Math.round(completionRate * 100)}% today</span>
                    </div>
                    <div className="flex gap-1 justify-between overflow-hidden h-16 items-end">
                        {Array.from({ length: 12 }).map((_, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                    const flatIndex = weekIndex * 7 + dayIndex;
                                    // If it's the last cell (today), use real completion rate
                                    let intensity = 0;
                                    if (flatIndex === 70 - 1) {
                                        intensity = completionRate;
                                    } else if (flatIndex < streakData.length) {
                                        intensity = streakData[flatIndex];
                                    }

                                    let bgClass = 'bg-gray-800';
                                    if (intensity > 0.75) bgClass = 'bg-orange-500';
                                    else if (intensity > 0.5) bgClass = 'bg-orange-600/70';
                                    else if (intensity > 0.25) bgClass = 'bg-orange-800/50';

                                    return (
                                        <div key={dayIndex} className={`w-2.5 h-2.5 rounded-sm ${bgClass}`}></div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today Header & Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Today</h2>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isAdding ? 'bg-red-500 rotate-45' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        <PlusIcon className={`w-6 h-6 ${isAdding ? 'text-white' : ''}`} />
                    </button>
                </div>

                {/* Add Task Input */}
                {isAdding && (
                    <div className="mb-6 animate-slide-down">
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="What needs to be done?"
                                className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
                            />
                            <button 
                                onClick={addNewTask}
                                className="bg-orange-500 px-4 rounded-xl font-bold text-sm hover:bg-orange-600"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Checkbox Task List */}
                <div className="space-y-4">
                    {filteredTodos.length === 0 ? (
                         <div className="text-gray-500 text-center py-10">
                            <p>No tasks for this date.</p>
                            <p className="text-sm mt-1">Time to relax or plan ahead!</p>
                         </div>
                    ) : (
                        filteredTodos.map((todo) => (
                            <div 
                                key={todo.id} 
                                className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer ${todo.completed ? 'opacity-60' : ''}`}
                                onClick={() => toggleTaskCompletion(todo.id)}
                            >
                                {/* Checkbox UI */}
                                <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                                    ${todo.completed ? 'bg-orange-500 border-orange-500' : 'border-gray-500 group-hover:border-orange-400'}`}
                                >
                                    {todo.completed && <CheckIcon className="w-4 h-4 text-white" />}
                                </div>

                                <div className="flex-grow">
                                    <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {todo.text}
                                    </h3>
                                    <p className="text-gray-400 text-xs">{todo.description || todo.time}</p>
                                </div>
                                
                                {todo.completed && (
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await api.deleteTodo(todo.id);
                                                setTodos(prev => prev.filter(t => t.id !== todo.id));
                                            } catch (error) {
                                                console.error('Failed to delete todo:', error);
                                            }
                                        }}
                                        className="text-gray-600 hover:text-red-400 p-2"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlannerDashboard;
