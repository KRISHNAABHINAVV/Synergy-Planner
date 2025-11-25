
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, PlusIcon, TrashIcon, PhotoIcon, ChartPieIcon, PencilSquareIcon, TableCellsIcon, XMarkIcon } from '../Icons';
import { Note } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../services/api';

// --- Types for Block Editor ---
type BlockType = 'text' | 'image' | 'chart' | 'drawing' | 'table';

interface Block {
    id: string;
    type: BlockType;
    content: any; // Flexible content based on type
}

interface ChartData {
    name: string;
    value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#F43F5E', '#8B5CF6'];

// --- Helper Components ---

// 1. Drawing Canvas Component
const DrawingCanvas: React.FC<{ onSave: (dataUrl: string) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth - 48; // Padding correction
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'currentColor'; // Uses CSS color
                ctx.lineWidth = 3;
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleSave = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL());
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onCancel} className="text-gray-500">Cancel</button>
                <h3 className="font-bold text-lg dark:text-white">Draw</h3>
                <button onClick={handleSave} className="text-orange-500 font-bold">Insert</button>
            </div>
            <div className="flex-grow border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden touch-none bg-white">
                <canvas 
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
            </div>
        </div>
    );
};

// 2. Chart Editor Component
const ChartEditor: React.FC<{ onSave: (data: ChartData[]) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [data, setData] = useState<ChartData[]>([{ name: 'Item A', value: 50 }, { name: 'Item B', value: 30 }]);
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('');

    const addDataPoint = () => {
        if (newName && newValue) {
            setData([...data, { name: newName, value: Number(newValue) }]);
            setNewName('');
            setNewValue('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Create Pie Chart</h3>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {data.map((d, i) => (
                        <div key={i} className="flex justify-between text-sm dark:text-gray-300 border-b border-gray-100 dark:border-white/10 pb-1">
                            <span>{d.name}</span>
                            <span>{d.value}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mb-4">
                    <input 
                        className="flex-1 bg-gray-100 dark:bg-white/10 rounded-lg px-3 py-2 text-sm dark:text-white outline-none"
                        placeholder="Label" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                    />
                    <input 
                        className="w-20 bg-gray-100 dark:bg-white/10 rounded-lg px-3 py-2 text-sm dark:text-white outline-none"
                        placeholder="Value" 
                        type="number" 
                        value={newValue} 
                        onChange={e => setNewValue(e.target.value)} 
                    />
                    <button onClick={addDataPoint} className="bg-orange-500 text-white rounded-lg px-3 text-lg">+</button>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="text-gray-500">Cancel</button>
                    <button onClick={() => onSave(data)} className="text-orange-500 font-bold">Insert Chart</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const sampleNotes: Note[] = [
    { id: 1, title: "Project Ideas", content: JSON.stringify([{id: '1', type: 'text', content: "New UI design for the wellness app using high contrast themes."}]), date: new Date(), category: "Work" },
];

const NotesDashboard: React.FC = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Editor State
    const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
    const [editorTitle, setEditorTitle] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Modal States
    const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
    const [showChartEditor, setShowChartEditor] = useState(false);

    // Load notes from backend
    useEffect(() => {
        const loadNotes = async () => {
            try {
                setIsLoading(true);
                const fetchedNotes = await api.getNotes();
                // Convert date strings to Date objects
                const notesWithDates = fetchedNotes.map(note => ({
                    ...note,
                    date: new Date(note.date)
                }));
                setNotes(notesWithDates);
            } catch (error) {
                console.error('Failed to load notes:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadNotes();
    }, []);

    // --- Initialization ---
    const initEditor = (note?: Note) => {
        if (note) {
            setActiveNoteId(note.id);
            setEditorTitle(note.title);
            try {
                // Try to parse as blocks
                const parsedContent = JSON.parse(note.content);
                if (Array.isArray(parsedContent)) {
                    setBlocks(parsedContent);
                } else {
                    // Legacy plain text fallback
                    setBlocks([{ id: Date.now().toString(), type: 'text', content: note.content }]);
                }
            } catch (e) {
                 // Legacy plain text fallback
                 setBlocks([{ id: Date.now().toString(), type: 'text', content: note.content }]);
            }
        } else {
            setActiveNoteId(null);
            setEditorTitle("");
            setBlocks([{ id: Date.now().toString(), type: 'text', content: "" }]);
        }
        setView('editor');
        setIsMenuOpen(false);
    };

    // --- Block Management ---
    const addBlock = (type: BlockType, content: any = "") => {
        setBlocks(prev => [...prev, { id: Date.now().toString(), type, content }]);
        setIsMenuOpen(false);
    };

    const updateBlock = (id: string, content: any) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    // --- Image Handling ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                addBlock('image', ev.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Table Handling ---
    const addTable = () => {
        const initialTable = [
            ['Header 1', 'Header 2'],
            ['Data 1', 'Data 2']
        ];
        addBlock('table', initialTable);
    };

    const updateTableCell = (blockId: string, rowIndex: number, colIndex: number, value: string) => {
        const block = blocks.find(b => b.id === blockId);
        if (block && block.type === 'table') {
            const newTable = [...block.content];
            newTable[rowIndex] = [...newTable[rowIndex]];
            newTable[rowIndex][colIndex] = value;
            updateBlock(blockId, newTable);
        }
    };

    const addTableRow = (blockId: string) => {
        const block = blocks.find(b => b.id === blockId);
        if (block) {
            const cols = block.content[0].length;
            const newRow = Array(cols).fill('');
            updateBlock(blockId, [...block.content, newRow]);
        }
    };

    // --- Save & Delete ---
    const handleSave = async () => {
        // Filter out empty text blocks if that's all there is, but usually keep structure
        const validBlocks = blocks.filter(b => b.type !== 'text' || b.content.trim() !== "");
        
        if (!editorTitle.trim() && validBlocks.length === 0) {
            setView('list');
            return;
        }

        const serializedContent = JSON.stringify(blocks);

        try {
            if (activeNoteId) {
                // Update existing note
                const updatedNote = await api.updateNote(activeNoteId, {
                    title: editorTitle,
                    content: serializedContent,
                    date: new Date().toISOString()
                });
                setNotes(prev => prev.map(n => n.id === activeNoteId ? {
                    ...updatedNote,
                    date: new Date(updatedNote.date)
                } : n));
            } else {
                // Create new note
                const newNote = await api.createNote({
                    title: editorTitle || "Untitled Note",
                    content: serializedContent,
                    date: new Date().toISOString(),
                    category: "General"
                });
                setNotes([{
                    ...newNote,
                    date: new Date(newNote.date)
                }, ...notes]);
            }
            setView('list');
        } catch (error) {
            console.error('Failed to save note:', error);
            alert('Failed to save note. Please try again.');
        }
    };

    const handleDeleteNote = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.deleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };

    const getNotePreview = (contentStr: string) => {
        try {
            const parsed = JSON.parse(contentStr);
            if(Array.isArray(parsed)) {
                const text = parsed.find((b: any) => b.type === 'text')?.content || "";
                const hasMedia = parsed.some((b: any) => b.type !== 'text');
                return text + (hasMedia && !text ? "[Rich Media]" : "") + (hasMedia && text ? "..." : "");
            }
            return contentStr;
        } catch {
            return contentStr;
        }
    }

    // --- Render ---
    if (view === 'list') {
        return (
            <div className="min-h-full bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
                        <p className="text-gray-500 mt-1 font-medium">{notes.length} notes</p>
                    </div>
                    <button 
                        onClick={() => initEditor()} 
                        className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-transform hover:scale-105 active:scale-95"
                    >
                        <PlusIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-4 pb-24">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-20">
                            <p className="text-lg font-medium">Loading notes...</p>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center text-gray-400 py-20">
                            <p className="text-lg font-medium">No notes yet</p>
                            <p className="text-sm mt-2">Tap + to add text, images, or charts</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <div 
                                key={note.id} 
                                onClick={() => initEditor(note)}
                                className="group bg-white dark:bg-white/10 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-100 dark:hover:border-white/10 transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 pr-10">
                                        {note.title || "Untitled"}
                                    </h3>
                                    <button 
                                        onClick={(e) => handleDeleteNote(note.id, e)}
                                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 line-clamp-3 text-base leading-relaxed mb-4">
                                    {getNotePreview(note.content) || "Empty note"}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                                    {note.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // EDITOR VIEW
    return (
        <div className="flex flex-col h-full min-h-[80vh] bg-white dark:bg-black rounded-3xl overflow-hidden relative">
            
            {/* Modals */}
            {showDrawingCanvas && (
                <DrawingCanvas 
                    onSave={(url) => { addBlock('drawing', url); setShowDrawingCanvas(false); }} 
                    onCancel={() => setShowDrawingCanvas(false)} 
                />
            )}
            {showChartEditor && (
                <ChartEditor 
                    onSave={(data) => { addBlock('chart', data); setShowChartEditor(false); }} 
                    onCancel={() => setShowChartEditor(false)} 
                />
            )}

            {/* Editor Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-black z-20">
                <button 
                    onClick={handleSave}
                    className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-900 dark:text-white"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={handleSave} 
                    className="px-6 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-80 transition-opacity"
                >
                    Done
                </button>
            </div>

            {/* Editor Content Area */}
            <div className="flex-grow px-6 py-6 overflow-y-auto pb-32">
                <input 
                    type="text" 
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Title" 
                    className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none mb-6"
                />
                
                <div className="space-y-6">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="relative group">
                             {/* Delete Block Button */}
                            {blocks.length > 1 && (
                                <button 
                                    onClick={() => removeBlock(block.id)}
                                    className="absolute -right-2 -top-2 p-1 bg-red-100 dark:bg-red-900/50 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}

                            {/* Text Block */}
                            {block.type === 'text' && (
                                <textarea 
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    placeholder="Type here..." 
                                    className="w-full bg-transparent text-lg leading-relaxed text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none resize-none overflow-hidden"
                                    onInput={(e) => {
                                        e.currentTarget.style.height = "auto";
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                                    }}
                                    // Auto-focus new text blocks
                                    ref={el => { if(el && !block.content && index === blocks.length -1) el.focus() }}
                                />
                            )}

                            {/* Image Block */}
                            {block.type === 'image' && (
                                <img src={block.content} alt="Note attachment" className="w-full rounded-2xl border border-gray-100 dark:border-white/10" />
                            )}

                            {/* Drawing Block */}
                            {block.type === 'drawing' && (
                                <div className="bg-white p-2 rounded-2xl border border-gray-100">
                                    <img src={block.content} alt="Drawing" className="w-full" />
                                </div>
                            )}

                            {/* Chart Block */}
                            {block.type === 'chart' && (
                                <div className="h-64 w-full bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={block.content}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {block.content.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Table Block */}
                            {block.type === 'table' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <tbody>
                                            {block.content.map((row: string[], rowIndex: number) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, colIndex) => (
                                                        <td key={colIndex} className="border border-gray-200 dark:border-gray-700 p-0">
                                                            <input 
                                                                type="text" 
                                                                value={cell}
                                                                onChange={(e) => updateTableCell(block.id, rowIndex, colIndex, e.target.value)}
                                                                className="w-full p-2 bg-transparent text-sm dark:text-white outline-none"
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button 
                                        onClick={() => addTableRow(block.id)}
                                        className="mt-2 text-xs text-orange-500 font-bold hover:underline"
                                    >
                                        + Add Row
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Toolbar */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
                 <div className={`bg-black/80 dark:bg-white/20 backdrop-blur-lg text-white p-2 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 ${isMenuOpen ? 'px-4' : 'px-2'}`}>
                    
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${isMenuOpen ? 'rotate-45 bg-white/20' : 'bg-orange-500'}`}
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>

                    {isMenuOpen && (
                        <div className="flex items-center gap-4 ml-2 animate-fade-in">
                             <button onClick={() => addBlock('text')} className="p-2 hover:bg-white/20 rounded-full" title="Text">
                                <span className="font-serif font-bold text-lg">T</span>
                             </button>
                             
                             <label className="p-2 hover:bg-white/20 rounded-full cursor-pointer" title="Image">
                                <PhotoIcon className="w-6 h-6" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                             </label>

                             <button onClick={() => setShowChartEditor(true)} className="p-2 hover:bg-white/20 rounded-full" title="Chart">
                                <ChartPieIcon className="w-6 h-6" />
                             </button>

                             <button onClick={() => setShowDrawingCanvas(true)} className="p-2 hover:bg-white/20 rounded-full" title="Draw">
                                <PencilSquareIcon className="w-6 h-6" />
                             </button>

                             <button onClick={addTable} className="p-2 hover:bg-white/20 rounded-full" title="Table">
                                <TableCellsIcon className="w-6 h-6" />
                             </button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default NotesDashboard;
