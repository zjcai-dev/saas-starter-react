import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, FileText, AlertTriangle, Info, AlertCircle, Bug } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface LogFile {
    name: string;
    date: string | null;
    size: string;
    modified: number;
}

interface LogEntry {
    timestamp: string;
    env: string;
    level: string;
    message: string;
}

interface LogViewerProps {
    files: LogFile[];
    currentFile: { name: string; size: string } | null;
    logs: LogEntry[];
}

export default function LogViewer({ files, currentFile, logs }: LogViewerProps) {
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState<string | null>(null);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                                  log.timestamp.includes(search);
            const matchesLevel = filterLevel ? log.level === filterLevel : true;
            return matchesSearch && matchesLevel;
        });
    }, [logs, search, filterLevel]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
            case 'critical':
            case 'emergency':
            case 'alert':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'warning':
            case 'notice':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'info':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'debug':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
            case 'critical':
                return <AlertCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'info':
                return <Info className="h-4 w-4" />;
            case 'debug':
                return <Bug className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const handleFileSelect = (fileName: string) => {
        router.get('/logs', { file: fileName }, { preserveState: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Logs',
                    href: '/logs',
                },
            ]}
        >
            <Head title="System Logs" />

            <div className="flex h-[calc(100vh-8rem)] gap-6 p-4">
                {/* Sidebar: File List */}
                <Card className="w-80 flex-shrink-0 flex flex-col">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-lg">Log Files</CardTitle>
                        <CardDescription>Select a file to view</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            <div className="flex flex-col">
                                {files.map((file) => (
                                    <button
                                        key={file.name}
                                        onClick={() => handleFileSelect(file.name)}
                                        className={cn(
                                            "flex items-center justify-between p-3 text-sm text-left hover:bg-muted transition-colors border-b last:border-0",
                                            currentFile?.name === file.name && "bg-muted font-medium"
                                        )}
                                    >
                                        <div className="flex flex-col truncate">
                                            <span className="truncate">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">{file.date || 'Unknown Date'}</span>
                                        </div>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {file.size}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content: Logs */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {currentFile?.name || 'Select a log file'}
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {currentFile?.size}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {filteredLogs.length} entries found
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => router.reload()}
                                title="Refresh Logs"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    
                    {/* Filters Toolbar */}
                    <div className="p-4 border-b bg-muted/30 flex gap-4 items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-9 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['error', 'warning', 'info', 'debug'].map((level) => (
                                <Button
                                    key={level}
                                    variant={filterLevel === level ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilterLevel(filterLevel === level ? null : level)}
                                    className={cn(
                                        "capitalize h-9",
                                        filterLevel === level && getLevelColor(level).replace('bg-', 'bg-').replace('text-', '') // Simple generic active style
                                    )}
                                >
                                    {level}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <CardContent className="p-0 flex-1 overflow-hidden bg-slate-950">
                        <div className="h-full overflow-y-auto">
                            <div className="p-4 font-mono text-xs space-y-1">
                                {filteredLogs.length === 0 ? (
                                    <div className="text-slate-500 text-center py-10 italic">
                                        No log entries found.
                                    </div>
                                ) : (
                                    filteredLogs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className={cn(
                                                "flex gap-3 p-2 rounded hover:bg-slate-900/50 transition-colors border-l-2",
                                                getLevelColor(log.level).replace('text-', 'border-')
                                            )}
                                        >
                                            <div className="text-slate-500 w-32 flex-shrink-0 truncate select-none">
                                                {log.timestamp}
                                            </div>
                                            <div className={cn("w-16 flex-shrink-0 uppercase font-bold text-center rounded px-1 text-[10px] leading-5 h-5", getLevelColor(log.level))}>
                                                {log.level}
                                            </div>
                                            <div className="flex-1 text-slate-300 break-all whitespace-pre-wrap">
                                                {log.message}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
