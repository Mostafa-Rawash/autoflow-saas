#!/bin/bash

# AutoFlow Process Management Script
# Manage all services: start, stop, restart, status, logs

set -e

ACTION=${1:-status}
SERVICE=${2:-all}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3001
LANDING_PORT=8080
WHATSAPP_PORT=3002

# Directories
BACKEND_DIR="./frontend/backend"
FRONTEND_DIR="./frontend/frontend"
LANDING_DIR="./landing-pages"
WHATSAPP_DIR="./whatsapp-service"

echo -e "${BLUE}AutoFlow Process Manager${NC}"
echo "========================="

# ========================================
# CHECK PORT
# ========================================

check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

get_port_process() {
    local port=$1
    lsof -t -i :$port 2>/dev/null || echo ""
}

# ========================================
# STATUS
# ========================================

status() {
    echo -e "\n${YELLOW}Service Status:${NC}\n"
    
    # Backend API
    if check_port $BACKEND_PORT; then
        pid=$(get_port_process $BACKEND_PORT)
        echo -e "Backend API (:$BACKEND_PORT): ${GREEN}✅ Running${NC} (PID: $pid)"
    else
        echo -e "Backend API (:$BACKEND_PORT): ${RED}❌ Stopped${NC}"
    fi
    
    # Frontend Dashboard
    if check_port $FRONTEND_PORT; then
        pid=$(get_port_process $FRONTEND_PORT)
        echo -e "Frontend Dashboard (:$FRONTEND_PORT): ${GREEN}✅ Running${NC} (PID: $pid)"
    else
        echo -e "Frontend Dashboard (:$FRONTEND_PORT): ${RED}❌ Stopped${NC}"
    fi
    
    # Landing Pages
    if check_port $LANDING_PORT; then
        pid=$(get_port_process $LANDING_PORT)
        echo -e "Landing Pages (:$LANDING_PORT): ${GREEN}✅ Running${NC} (PID: $pid)"
    else
        echo -e "Landing Pages (:$LANDING_PORT): ${RED}❌ Stopped${NC}"
    fi
    
    # WhatsApp Service
    if check_port $WHATSAPP_PORT; then
        pid=$(get_port_process $WHATSAPP_PORT)
        echo -e "WhatsApp Service (:$WHATSAPP_PORT): ${GREEN}✅ Running${NC} (PID: $pid)"
    else
        echo -e "WhatsApp Service (:$WHATSAPP_PORT): ${YELLOW}⏸️ Stopped${NC} (Optional)"
    fi
    
    # PM2 processes
    if command -v pm2 &> /dev/null && pm2 list 2>/dev/null | grep -q "online"; then
        echo -e "\n${BLUE}PM2 Processes:${NC}"
        pm2 list
    fi
}

# ========================================
# START
# ========================================

start() {
    echo -e "\n${GREEN}Starting services...${NC}\n"
    
    case $SERVICE in
        backend|api)
            start_backend
            ;;
        frontend|dashboard)
            start_frontend
            ;;
        landing)
            start_landing
            ;;
        whatsapp)
            start_whatsapp
            ;;
        all)
            start_backend
            start_frontend
            start_landing
            start_whatsapp
            ;;
        *)
            echo "Unknown service: $SERVICE"
            echo "Usage: $0 start [backend|frontend|landing|whatsapp|all]"
            ;;
    esac
}

start_backend() {
    echo "Starting Backend API..."
    if check_port $BACKEND_PORT; then
        echo -e "${YELLOW}Backend already running on port $BACKEND_PORT${NC}"
        return
    fi
    
    cd $BACKEND_DIR
    npm start > ../../logs/backend.log 2>&1 &
    echo $! > ../../logs/backend.pid
    cd - > /dev/null
    sleep 2
    
    if check_port $BACKEND_PORT; then
        echo -e "${GREEN}✅ Backend started on port $BACKEND_PORT${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
    fi
}

start_frontend() {
    echo "Starting Frontend Dashboard..."
    if check_port $FRONTEND_PORT; then
        echo -e "${YELLOW}Frontend already running on port $FRONTEND_PORT${NC}"
        return
    fi
    
    cd $FRONTEND_DIR
    npm start > ../../logs/frontend.log 2>&1 &
    echo $! > ../../logs/frontend.pid
    cd - > /dev/null
    sleep 3
    
    if check_port $FRONTEND_PORT; then
        echo -e "${GREEN}✅ Frontend started on port $FRONTEND_PORT${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
    fi
}

start_landing() {
    echo "Starting Landing Pages..."
    if check_port $LANDING_PORT; then
        echo -e "${YELLOW}Landing pages already running on port $LANDING_PORT${NC}"
        return
    fi
    
    cd $LANDING_DIR
    node server.js > ../logs/landing.log 2>&1 &
    echo $! > ../logs/landing.pid
    cd - > /dev/null
    sleep 2
    
    if check_port $LANDING_PORT; then
        echo -e "${GREEN}✅ Landing pages started on port $LANDING_PORT${NC}"
    else
        echo -e "${RED}❌ Landing pages failed to start${NC}"
    fi
}

start_whatsapp() {
    echo "Starting WhatsApp Service..."
    if check_port $WHATSAPP_PORT; then
        echo -e "${YELLOW}WhatsApp service already running on port $WHATSAPP_PORT${NC}"
        return
    fi
    
    cd $WHATSAPP_DIR
    npm start > ../logs/whatsapp.log 2>&1 &
    echo $! > ../logs/whatsapp.pid
    cd - > /dev/null
    sleep 3
    
    if check_port $WHATSAPP_PORT; then
        echo -e "${GREEN}✅ WhatsApp service started on port $WHATSAPP_PORT${NC}"
    else
        echo -e "${RED}❌ WhatsApp service failed to start${NC}"
    fi
}

# ========================================
# STOP
# ========================================

stop() {
    echo -e "\n${RED}Stopping services...${NC}\n"
    
    case $SERVICE in
        backend|api)
            stop_backend
            ;;
        frontend|dashboard)
            stop_frontend
            ;;
        landing)
            stop_landing
            ;;
        whatsapp)
            stop_whatsapp
            ;;
        all)
            stop_backend
            stop_frontend
            stop_landing
            stop_whatsapp
            ;;
        *)
            echo "Unknown service: $SERVICE"
            echo "Usage: $0 stop [backend|frontend|landing|whatsapp|all]"
            ;;
    esac
}

stop_backend() {
    echo "Stopping Backend API..."
    if [ -f logs/backend.pid ]; then
        kill $(cat logs/backend.pid) 2>/dev/null || true
        rm logs/backend.pid
    fi
    
    pid=$(get_port_process $BACKEND_PORT)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Backend stopped${NC}"
}

stop_frontend() {
    echo "Stopping Frontend Dashboard..."
    if [ -f logs/frontend.pid ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null || true
        rm logs/frontend.pid
    fi
    
    pid=$(get_port_process $FRONTEND_PORT)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Frontend stopped${NC}"
}

stop_landing() {
    echo "Stopping Landing Pages..."
    if [ -f logs/landing.pid ]; then
        kill $(cat logs/landing.pid) 2>/dev/null || true
        rm logs/landing.pid
    fi
    
    pid=$(get_port_process $LANDING_PORT)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Landing pages stopped${NC}"
}

stop_whatsapp() {
    echo "Stopping WhatsApp Service..."
    if [ -f logs/whatsapp.pid ]; then
        kill $(cat logs/whatsapp.pid) 2>/dev/null || true
        rm logs/whatsapp.pid
    fi
    
    pid=$(get_port_process $WHATSAPP_PORT)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ WhatsApp service stopped${NC}"
}

# ========================================
# RESTART
# ========================================

restart() {
    stop
    sleep 2
    start
}

# ========================================
# LOGS
# ========================================

logs() {
    case $SERVICE in
        backend|api)
            tail -f logs/backend.log
            ;;
        frontend|dashboard)
            tail -f logs/frontend.log
            ;;
        landing)
            tail -f logs/landing.log
            ;;
        whatsapp)
            tail -f logs/whatsapp.log
            ;;
        all)
            echo "Showing all logs (Ctrl+C to exit)..."
            tail -f logs/*.log
            ;;
        *)
            echo "Usage: $0 logs [backend|frontend|landing|whatsapp|all]"
            ;;
    esac
}

# ========================================
# HEALTH CHECK
# ========================================

health() {
    echo -e "\n${BLUE}Health Checks:${NC}\n"
    
    # Backend health
    echo "Backend API:"
    if curl -s http://localhost:$BACKEND_PORT/health | grep -q "ok"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy${NC}"
    fi
    
    # Frontend health
    echo "Frontend Dashboard:"
    if curl -s http://localhost:$FRONTEND_PORT | grep -q "AutoFlow"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy${NC}"
    fi
    
    # Landing health
    echo "Landing Pages:"
    if curl -s http://localhost:$LANDING_PORT | grep -q "AutoFlow"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy${NC}"
    fi
    
    # WhatsApp health
    echo "WhatsApp Service:"
    if curl -s http://localhost:$WHATSAPP_PORT/health 2>/dev/null | grep -q "ok"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${YELLOW}⏸️ Not Running (Optional)${NC}"
    fi
}

# ========================================
# MAIN
# ========================================

mkdir -p logs

case $ACTION in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    health)
        health
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|health} [service]"
        echo ""
        echo "Services: backend, frontend, landing, whatsapp, all"
        echo ""
        echo "Examples:"
        echo "  $0 start all       # Start all services"
        echo "  $0 stop backend     # Stop backend API"
        echo "  $0 status           # Check service status"
        echo "  $0 logs frontend    # View frontend logs"
        echo "  $0 health           # Run health checks"
        ;;
esac