<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreFeatureRequest;
use App\Http\Requests\System\UpdateFeatureRequest;
use App\Models\System\Feature;
use App\Services\System\FeatureService;
use Illuminate\Http\JsonResponse;

class FeatureController extends Controller
{
    public function __construct(
        protected FeatureService $featureService
    ) {
    }

    public function index(): JsonResponse
    {
        $features = $this->featureService->listFeatures();

        return response()->json($features);
    }

    public function store(StoreFeatureRequest $request): JsonResponse
    {
        $feature = $this->featureService->createFeature($request->validated());

        return response()->json($feature, 201);
    }

    public function show(Feature $feature): JsonResponse
    {
        return response()->json($feature);
    }

    public function update(UpdateFeatureRequest $request, Feature $feature): JsonResponse
    {
        $feature = $this->featureService->updateFeature($feature, $request->validated());

        return response()->json($feature);
    }

    public function destroy(Feature $feature): JsonResponse
    {
        $this->featureService->deleteFeature($feature);

        return response()->json([], 204);
    }
}

