<?php

namespace App\Services\System;

use App\Models\System\Feature;

class FeatureService
{
    public function listFeatures()
    {
        return Feature::orderBy('name')->get();
    }

    public function createFeature(array $data): Feature
    {
        return Feature::create($data);
    }

    public function updateFeature(Feature $feature, array $data): Feature
    {
        $feature->update($data);

        return $feature;
    }

    public function deleteFeature(Feature $feature): void
    {
        $feature->plans()->detach();
        $feature->delete();
    }
}

