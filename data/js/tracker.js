// GitHub Pages JSON data URL
const JOBS_DATA_URL = 'https://[your-username].github.io/[repo-name]/data/jobs.json';

class JobTracker {
    constructor() {
        this.jobs = [];
        this.init();
    }
    
    async init() {
        await this.loadJobs();
        this.setupEventListeners();
        this.checkUrlParam();
    }
    
    async loadJobs() {
        try {
            const response = await fetch(JOBS_DATA_URL);
            const data = await response.json();
            this.jobs = data.jobs;
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    }
    
    setupEventListeners() {
        document.getElementById('trackButton').addEventListener('click', () => this.trackJob());
        document.getElementById('jobInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.trackJob();
        });
    }
    
    checkUrlParam() {
        const params = new URLSearchParams(window.location.search);
        const jobParam = params.get('job');
        if (jobParam) {
            document.getElementById('jobInput').value = jobParam;
            // Auto-track if you want:
            // setTimeout(() => this.trackJob(), 500);
        }
    }
    
    trackJob() {
        const jobNumber = document.getElementById('jobInput').value.trim().toUpperCase();
        const errorDiv = document.getElementById('error');
        const resultsDiv = document.getElementById('results');
        
        // Reset
        errorDiv.style.display = 'none';
        resultsDiv.style.display = 'none';
        
        if (!jobNumber) {
            this.showError('Please enter a job number');
            return;
        }
        
        const job = this.jobs.find(j => 
            j.jobNumber.toUpperCase() === jobNumber
        );
        
        if (job) {
            this.displayJob(job);
        } else {
            this.showError('Job not found. Please check your job number.');
        }
    }
    
    displayJob(job) {
        const resultsDiv = document.getElementById('results');
        const template = document.getElementById('jobTemplate');
        
        // Clone template
        const clone = template.content.cloneNode(true);
        
        // Fill data
        clone.querySelector('.job-number').textContent = job.jobNumber;
        clone.querySelector('.job-status').textContent = job.status;
        clone.querySelector('.job-updated').textContent = this.formatDate(job.lastUpdated);
        clone.querySelector('.job-completion').textContent = this.formatDate(job.estimatedCompletion);
        clone.querySelector('.job-notes').textContent = job.notes || 'No notes available';
        
        // Set status badge
        const statusBadge = clone.querySelector('.status-badge');
        statusBadge.textContent = job.status;
        statusBadge.className = `status-badge ${this.getStatusClass(job.status)}`;
        
        // Clear and show
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(clone);
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    formatDate(dateString) {
        if (!dateString) return 'To be confirmed';
        try {
            return new Date(dateString).toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }
    
    getStatusClass(status) {
        const statusMap = {
            'completed': 'status-completed',
            'in progress': 'status-in-progress',
            'pending': 'status-pending',
            'ready': 'status-ready'
        };
        
        const statusLower = status.toLowerCase();
        for (const [key, className] of Object.entries(statusMap)) {
            if (statusLower.includes(key)) {
                return className;
            }
        }
        return 'status-in-progress';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.jobTracker = new JobTracker();
});
