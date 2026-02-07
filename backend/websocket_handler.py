"""
WebSocket handler for real-time delivery tracking
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import asyncio
import json
import random
from datetime import datetime

class DeliveryTracker:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.tracking_tasks: Dict[str, asyncio.Task] = {}
        
    async def connect(self, websocket: WebSocket, order_id: str):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)
        
        # Start simulated tracking if not already running
        if order_id not in self.tracking_tasks:
            self.tracking_tasks[order_id] = asyncio.create_task(
                self.simulate_delivery(order_id)
            )
    
    def disconnect(self, websocket: WebSocket, order_id: str):
        if order_id in self.active_connections:
            self.active_connections[order_id].remove(websocket)
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]
                # Cancel tracking task if no one is watching
                if order_id in self.tracking_tasks:
                    self.tracking_tasks[order_id].cancel()
                    del self.tracking_tasks[order_id]
    
    async def broadcast_location(self, order_id: str, data: dict):
        if order_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[order_id]:
                try:
                    await connection.send_json(data)
                except:
                    dead_connections.append(connection)
            
            # Remove dead connections
            for conn in dead_connections:
                self.active_connections[order_id].remove(conn)
    
    async def simulate_delivery(self, order_id: str):
        """Simulate delivery movement from warehouse to destination"""
        # Start and end coordinates (Mumbai area)
        start_lat, start_lng = 19.0760, 72.8777  # Mumbai central
        end_lat, end_lng = 19.1136, 72.8697  # Destination
        
        steps = 50  # Total simulation steps
        
        for step in range(steps + 1):
            if order_id not in self.active_connections:
                break
                
            # Linear interpolation
            progress = step / steps
            current_lat = start_lat + (end_lat - start_lat) * progress
            current_lng = start_lng + (end_lng - start_lng) * progress
            
            # Add small random variation for realism
            current_lat += random.uniform(-0.0005, 0.0005)
            current_lng += random.uniform(-0.0005, 0.0005)
            
            # Calculate ETA
            remaining_steps = steps - step
            eta_minutes = max(1, int(remaining_steps * 0.5))
            
            # Determine status
            if progress < 0.1:
                status = "picked_up"
                status_text = "Order picked up from warehouse"
            elif progress < 0.9:
                status = "in_transit"
                status_text = "On the way to you"
            else:
                status = "arriving"
                status_text = "Almost there!"
            
            location_data = {
                "type": "location_update",
                "order_id": order_id,
                "timestamp": datetime.utcnow().isoformat(),
                "location": {
                    "lat": round(current_lat, 6),
                    "lng": round(current_lng, 6)
                },
                "progress": round(progress * 100, 1),
                "eta_minutes": eta_minutes,
                "status": status,
                "status_text": status_text,
                "driver": {
                    "name": "Rajesh Kumar",
                    "phone": "+91 9876543210",
                    "rating": 4.8,
                    "vehicle": "Bajaj Pulsar 150 - MH 02 AB 1234"
                }
            }
            
            await self.broadcast_location(order_id, location_data)
            
            # Wait before next update
            await asyncio.sleep(2)
        
        # Delivery completed
        if order_id in self.active_connections:
            await self.broadcast_location(order_id, {
                "type": "delivery_complete",
                "order_id": order_id,
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Order delivered successfully!"
            })

# Global tracker instance
delivery_tracker = DeliveryTracker()
