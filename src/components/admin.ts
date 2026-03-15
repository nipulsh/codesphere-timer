import { El } from "$src/components/element";
import { io, Socket } from "socket.io-client";

export class Admin {
  static socket: Socket | null = null;
  static token: string | null = localStorage.getItem('adminToken');
  static timerState: any = null;

  static init() {
    // Basic Layout Strategy:
    // We clear the #app root and build our own UI
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = '';
      appEl.className = 'relative z-10 w-full min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4';
    }

    if (!this.token) {
      this.renderLogin();
    } else {
      this.connectSocket();
      this.renderDashboard();
    }
  }

  static renderLogin() {
    const container = El.create({
      type: "div",
      classes: "bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-sm w-full flex flex-col gap-6"
    });

    const title = El.create({ type: "h2", classes: "text-2xl font-bold text-center", content: "Admin Login" });
    const errorMsg = El.create({ type: "p", classes: "text-red-400 text-sm hidden text-center", content: "Invalid password" });
    
    const input = El.create({ 
      type: "input", 
      classes: "w-full bg-neutral-700 rounded px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
    }) as HTMLInputElement;
    input.type = "password";
    input.placeholder = "Enter Password";
    
    // allow pressing enter to submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });

    const submitBtn = El.create({
      type: "button",
      classes: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors cursor-pointer",
      content: "Login"
    });

    submitBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: input.value })
        });
        
        const data = await res.json();
        
        if (res.ok && data.token) {
          localStorage.setItem('adminToken', data.token);
          this.token = data.token;
          const appEl = document.getElementById('app');
          if (appEl) appEl.innerHTML = '';
          this.connectSocket();
          this.renderDashboard();
        } else {
          errorMsg.classList.remove('hidden');
        }
      } catch (err) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = "Server error";
      }
    });

    container.appendChild(title);
    container.appendChild(errorMsg);
    container.appendChild(input);
    container.appendChild(submitBtn);

    El.append("app", container);
  }

  static connectSocket() {
    this.socket = io({
      auth: {
        token: this.token
      }
    });

    this.socket.on('timerState', (state) => {
      this.timerState = state;
      this.updateDashboardState();
    });

    this.socket.on('authStatus', (status) => {
      if (!status.isAdmin && this.token) {
        localStorage.removeItem('adminToken');
        window.location.reload();
      }
    });

    this.socket.on('disconnect', () => {
      this.timerState = null;
      this.updateDashboardState();
    });

    this.socket.on('connect_error', (err) => {
      console.error(err);
      if (err.message === 'xhr poll error') {
        // Just generic connection error
      }
    });
  }

  static renderDashboard() {
    const container = El.create({
      type: "div",
      classes: "bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-xl w-full flex flex-col gap-8"
    });
    container.id = "admin-dashboard";

    const header = El.create({
      type: "div",
      classes: "flex justify-between items-center border-b border-neutral-700 pb-4"
    });
    header.appendChild(El.create({ type: "h2", classes: "text-2xl font-bold text-white", content: "Timer Admin Controls" }));
    
    const logoutBtn = El.create({
      type: "button",
      classes: "text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm",
      content: "Logout"
    });
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      window.location.reload();
    });
    header.appendChild(logoutBtn);

    // Current State display
    const statusContainer = El.create({ type: "div", classes: "flex flex-col gap-2" });
    const statusLabel = El.create({ type: "div", classes: "text-neutral-400 text-sm font-semibold uppercase tracking-wider", content: "Current Status" });
    const statusValue = El.create({ type: "div", classes: "text-3xl font-mono text-green-400", content: "Loading..." });
    statusValue.id = "admin-status-value";
    
    statusContainer.appendChild(statusLabel);
    statusContainer.appendChild(statusValue);

    // Controls
    const controlsContainer = El.create({ type: "div", classes: "grid grid-cols-2 gap-4" });
    
    // Play/Pause
    const playPauseBtn = El.create({
      type: "button",
      classes: "col-span-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-xl",
      content: "Play / Pause"
    });
    playPauseBtn.id = "admin-playpause-btn";
    playPauseBtn.addEventListener('click', () => {
      if (!this.socket || !this.timerState) return;
      if (this.timerState.isPaused) {
        this.socket.emit('adminCommand', { type: 'PLAY' });
      } else {
        this.socket.emit('adminCommand', { type: 'PAUSE' });
      }
    });
    controlsContainer.appendChild(playPauseBtn);

    // Add / Subtract time
    const createTimeAdjustBtn = (label: string, minutes: number) => {
      const btn = El.create({
        type: "button",
        classes: "bg-neutral-700 hover:bg-neutral-600 text-neutral-300 font-semibold py-3 rounded-lg transition-colors cursor-pointer",
        content: label
      });
      btn.addEventListener('click', () => {
        if (!this.socket) return;
        this.socket.emit('adminCommand', { type: 'ADD_TIME', payload: minutes * 60 * 1000 });
      });
      return btn;
    };

    controlsContainer.appendChild(createTimeAdjustBtn("+5 Minutes", 5));
    controlsContainer.appendChild(createTimeAdjustBtn("-5 Minutes", -5));
    controlsContainer.appendChild(createTimeAdjustBtn("+1 Hour", 60));
    controlsContainer.appendChild(createTimeAdjustBtn("-1 Hour", -60));

    // Custom Timer Set
    const customContainer = El.create({ type: "div", classes: "flex gap-2 col-span-2 mt-4" });
    
    // Create label/group for Hours
    const createConfigInput = (placeholder: string, max: number) => {
        const wrap = El.create({type: "div", classes: "flex flex-col flex-1 gap-1"});
        wrap.appendChild(El.create({type: "label", classes: "text-xs text-neutral-400 font-semibold", content: placeholder}));
        const inp = El.create({
        type: "input",
        classes: "w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 font-mono"
        }) as HTMLInputElement;
        inp.type = "number";
        inp.min = "0";
        inp.max = max.toString();
        inp.placeholder = "00";
        wrap.appendChild(inp);
        return { wrap, inp };
    };

    const hInput = createConfigInput("Hours", 999);
    const mInput = createConfigInput("Minutes", 59);
    const sInput = createConfigInput("Seconds", 59);
    
    const setBtn = El.create({
      type: "button",
      classes: "bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors cursor-pointer self-end mb-[1px]",
      content: "SET"
    });
    
    setBtn.addEventListener('click', () => {
      if (!this.socket) return;
      const hours = parseInt(hInput.inp.value || "0", 10);
      const minutes = parseInt(mInput.inp.value || "0", 10);
      const seconds = parseInt(sInput.inp.value || "0", 10);
      
      const totalMs = ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
      this.socket.emit('adminCommand', { type: 'SET_TIME', payload: totalMs });
    });

    customContainer.appendChild(hInput.wrap);
    customContainer.appendChild(mInput.wrap);
    customContainer.appendChild(sInput.wrap);
    customContainer.appendChild(setBtn);
    
    controlsContainer.appendChild(customContainer);

    container.appendChild(header);
    container.appendChild(statusContainer);
    container.appendChild(controlsContainer);

    El.append("app", container);
  }

  static updateDashboardState() {
    const statusValue = document.getElementById('admin-status-value');
    const playPauseBtn = document.getElementById('admin-playpause-btn');
    
    if (statusValue) {
      if (!this.timerState) {
        statusValue.textContent = "DISCONNECTED";
        statusValue.className = "text-3xl font-mono text-red-500";
      } else if (this.timerState.isPaused) {
        statusValue.textContent = "PAUSED";
        statusValue.className = "text-3xl font-mono text-amber-400";
      } else {
        statusValue.textContent = "RUNNING";
        statusValue.className = "text-3xl font-mono text-green-400";
      }
    }

    if (playPauseBtn) {
      if (!this.timerState) {
        playPauseBtn.textContent = "CONNECTING...";
        playPauseBtn.className = "col-span-2 bg-neutral-700 text-neutral-500 font-bold py-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed text-xl";
      } else if (this.timerState.isPaused) {
        playPauseBtn.textContent = "▶ PLAY";
        playPauseBtn.className = "col-span-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-xl";
      } else {
        playPauseBtn.textContent = "⏸ PAUSE";
        playPauseBtn.className = "col-span-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-xl";
      }
    }
  }
}
