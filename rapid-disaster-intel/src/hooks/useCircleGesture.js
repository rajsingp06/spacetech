import { useEffect, useRef, useState } from 'react';
import * as turf from '@turf/turf';

export const useCircleGesture = (mapRef, onCircleDetected, isEnabled = true) => {
  const isDrawing = useRef(false);
  const points = useRef([]);
  const canvas = useRef(null);
  const ctx = useRef(null);
  
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isEnabled) {
      if (map) map.boxZoom.enable();
      return;
    }

    // Disable native shift+drag box zoom so it doesn't interfere
    map.boxZoom.disable();

    const setupCanvas = () => {
      const mapCanvas = map.getCanvas();
      if (!canvas.current) {
        canvas.current = document.createElement('canvas');
        canvas.current.style.position = 'absolute';
        canvas.current.style.top = '0';
        canvas.current.style.left = '0';
        canvas.current.style.pointerEvents = 'none'; // let clicks pass through
        canvas.current.style.zIndex = '10';
        map.getCanvasContainer().appendChild(canvas.current);
        ctx.current = canvas.current.getContext('2d');
      }
      
      const updateSize = () => {
        canvas.current.width = mapCanvas.clientWidth;
        canvas.current.height = mapCanvas.clientHeight;
      };
      updateSize();
      map.on('resize', updateSize);
      return () => map.off('resize', updateSize);
    };

    const cleanupCanvas = setupCanvas();

    const onMouseDown = (e) => {
      if (!isEnabled || e.originalEvent.button !== 0) return; // Only left click
      if (!e.originalEvent.shiftKey) return; 
      
      e.preventDefault();
      map.dragPan.disable(); // Disable map panning while drawing
      isDrawing.current = true;
      points.current = [{ x: e.point.x, y: e.point.y, lngLat: e.lngLat }];
      
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
      ctx.current.beginPath();
      ctx.current.moveTo(e.point.x, e.point.y);

      // Listen to window mouseup in case user releases outside map
      window.addEventListener('mouseup', onWindowMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDrawing.current) return;
      points.current.push({ x: e.point.x, y: e.point.y, lngLat: e.lngLat });
      
      ctx.current.lineTo(e.point.x, e.point.y);
      ctx.current.strokeStyle = '#3b82f6';
      ctx.current.lineWidth = 4;
      ctx.current.lineCap = 'round';
      ctx.current.lineJoin = 'round';
      ctx.current.stroke();
    };

    const onMouseUp = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      map.dragPan.enable();
      window.removeEventListener('mouseup', onWindowMouseUp);

      if (points.current.length >= 15) {
        analyzeGesture();
      } else {
        ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
      }
      points.current = [];
    };

    const onWindowMouseUp = (e) => {
       onMouseUp();
    };

    const analyzeGesture = () => {
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      points.current.forEach(p => {
        minLng = Math.min(minLng, p.lngLat.lng);
        maxLng = Math.max(maxLng, p.lngLat.lng);
        minLat = Math.min(minLat, p.lngLat.lat);
        maxLat = Math.max(maxLat, p.lngLat.lat);
      });

      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      const center = turf.point([centerLng, centerLat]);

      let totalDistance = 0;
      points.current.forEach(p => {
        const pt = turf.point([p.lngLat.lng, p.lngLat.lat]);
        totalDistance += turf.distance(center, pt, { units: 'meters' });
      });
      const avgRadius = totalDistance / points.current.length;

      const diameter = avgRadius * 2;
      // Removed 500m - 50km constraint for easier testing/MVP
      if (diameter >= 10) {
        onCircleDetected({
          center: { lat: centerLat, lng: centerLng },
          radius: avgRadius
        });
      }
      
      setTimeout(() => {
        if (ctx.current && canvas.current) {
           ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
        }
      }, 500);
    };

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);

    return () => {
      map.off('mousedown', onMouseDown);
      map.off('mousemove', onMouseMove);
      map.off('mouseup', onMouseUp);
      map.boxZoom.enable();
      window.removeEventListener('mouseup', onWindowMouseUp);
      if (cleanupCanvas) cleanupCanvas();
      if (canvas.current && canvas.current.parentNode) {
        canvas.current.parentNode.removeChild(canvas.current);
        canvas.current = null;
      }
    };
  }, [mapRef, onCircleDetected, isEnabled]);

  return null;
};
