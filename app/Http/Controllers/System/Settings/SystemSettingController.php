<?php

namespace App\Http\Controllers\System\Settings;

use App\Http\Controllers\Controller;
use App\Models\System\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    /**
     * Show the General settings page.
     */
    public function editGeneral()
    {
        return Inertia::render('system/settings/general', [
            'app_name' => Setting::where('key', 'app_name')->value('value') ?? config('app.name'),
            'app_logo' => Setting::where('key', 'app_logo')->value('value'),
        ]);
    }

    /**
     * Update General settings (Name & Logo).
     */
    public function updateGeneral(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_logo' => 'nullable|image|max:1024', // Max 1MB
        ]);

        Setting::updateOrCreate(
            ['key' => 'app_name'],
            ['value' => $validated['app_name']]
        );

        if ($request->hasFile('app_logo')) {
            $path = $request->file('app_logo')->store('logos', 'public');
            // Storage::url() requires 'public/' to be stripped if using standard link, 
            // but let's store the full path relative to storage/app usually, 
            // or just the filename if we use a specific disk.
            // Default filesystem 'public' stores in storage/app/public.
            // The public URL is /storage/logos/filename.
            
            // Let's store the relative path for Storage::url usage
            Setting::updateOrCreate(
                ['key' => 'app_logo'],
                ['value' => $path] // e.g., public/logos/xyz.png
            );
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Show the Guest Registration settings page using the existing Vue component.
     */
    public function editGuestRegistration()
    {
        $setting = Setting::where('key', 'guest_registration')->first();
        $enabled = $setting ? (bool) $setting->value : false;

        return Inertia::render('system/settings/guest-register', [
            'guest_registration_enabled' => $enabled,
        ]);
    }

    /**
     * Update the Guest Registration setting.
     */
    public function updateGuestRegistration(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        Setting::updateOrCreate(
            ['key' => 'guest_registration'],
            ['value' => $validated['enabled']]
        );

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
