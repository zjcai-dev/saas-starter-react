<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

class LogViewerController extends Controller
{
    public function index(Request $request)
    {
        $logPath = storage_path('logs');
        $files = [];

        // 1. Get all log files
        if (File::exists($logPath)) {
            $files = collect(File::files($logPath))
                ->map(function ($file) {
                    return [
                        'name' => $file->getFilename(),
                        'date' => $this->extractDate($file->getFilename()),
                        'size' => $this->formatBytes($file->getSize()),
                        'modified' => $file->getMTime(),
                    ];
                })
                ->filter(function ($file) {
                    return Str::startsWith($file['name'], 'laravel-');
                })
                ->sortByDesc('modified')
                ->values()
                ->toArray();
        }

        // 2. Determine selected file
        $selectedFileName = $request->input('file');
        
        // If no file selected, try to find today's log or the latest one
        if (!$selectedFileName) {
            $todayLog = 'laravel-' . now()->format('Y-m-d') . '.log';
            $selectedFileName = collect($files)->firstWhere('name', $todayLog) 
                ? $todayLog 
                : ($files[0]['name'] ?? null);
        }

        // 3. Read and parse content
        $logs = [];
        $currentLog = null;

        if ($selectedFileName && File::exists($logPath . '/' . $selectedFileName)) {
            $content = File::get($logPath . '/' . $selectedFileName);
            
            // Ensure content is valid UTF-8
            $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
            
            // Limit content size if too large? For now, read all. 
            // Better strategy for production: read last N lines or stream.
            // But for simple daily logs, full read is usually OK.
            
            $pattern = '/^\[(?<date>.*)\] (?<env>\w+)\.(?<level>\w+): (?<message>.*)/m';
            
            preg_match_all($pattern, $content, $matches, PREG_SET_ORDER, 0);

            $logs = [];
            foreach ($matches as $match) {
                // Log entries often have stack traces following them. 
                // Simple regex above matches the header line. 
                // Handling multiline logs properly is complex, 
                // but usually we just want the main lines for a quick viewer.
                // Or we can split by the date pattern.
                
                $logs[] = [
                    'timestamp' => $match['date'],
                    'env' => $match['env'],
                    'level' => strtolower($match['level']),
                    'message' => trim($match['message']),
                    // We could capture stack trace here if we split by entry instead of line matching
                ];
            }
            
            // Reverse to show newest first
            $logs = array_reverse($logs);

            $currentLog = [
                'name' => $selectedFileName,
                'size' => $this->formatBytes(File::size($logPath . '/' . $selectedFileName)),
            ];
        }

        return Inertia::render('system/logs/index', [
            'files' => $files,
            'currentFile' => $currentLog,
            'logs' => $logs,
        ]);
    }

    private function extractDate($filename)
    {
        preg_match('/laravel-(\d{4}-\d{2}-\d{2})\.log/', $filename, $matches);
        return $matches[1] ?? null;
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
