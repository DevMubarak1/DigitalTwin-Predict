# Dangote Cement ULESARB Competition: 4D Digital Twin

This project is a submission for the **DCP University Engineering Challenge | ULES ARB**, specifically targeting **Track 2: Predictive Maintenance and Reliability Early-Warning System**.

## The Origin Story
This project was born out of a collaboration between two passionate engineering undergraduates (currently in our 400 level):

- **Mubarak (Civil Engineering)**: An award-winning hackathon champion with extensive tech skills spanning software, hardware, AI, machine learning, data analysis, web development, and mobile gaming. Fluent in multiple programming languages, Mubarak drives the software architecture and full-stack integration of the dashboard.
- **Wale (Mechanical Engineering)**: A first-class scholar and top of his department. Wale brings deep expertise in mechanical design, crazy hardware simulations, AI, and ML. Everything a mechanical engineering professional strives to master, Wale has done it.

Together, we decided to tackle the industrial challenges posed by Dangote Cement by merging advanced mechanical simulation with cutting-edge software development.

## The 4D Digital Twin
Our solution focuses on the Obajana Line 4 Kiln. To predict equipment failure before it happens, we have developed a **4D Digital Twin** driven by a Reduced Order Model (ROM) Surrogate. 

Instead of running computationally heavy Finite Element Analysis (FEA) live, our dashboard uses a highly optimized AI surrogate that maps physical mechanical faults to equipment degradation in real-time.

### How It Works:
1. **Mechanical Fault Injection**: The dashboard allows operators to monitor (or simulate) mechanical faults, such as Tyre Clearance / Creep. 
2. **Ovality & Stress Mapping**: Based on the clearance, the AI calculates the shell ovality (deformation) using saturating polynomial fits derived from thousands of FEA design points.
3. **Refractory Wear & RUL Prediction**: The system instantly predicts the thermo-mechanical wear rate of the refractory bricks across four critical zones (Lower Transition, Burning, Upper Transition, Calcining). It then outputs the **Remaining Useful Life (RUL)** in days.
4. **Early-Warning System**: The digital twin automatically flags the "governing zone" (the zone closest to failure). If the predicted RUL drops below a configurable threshold (e.g., 60 days), it triggers a critical early warning, detailing the exact mechanical root cause.

## Technology Stack
- **AI Surrogate Model**: Pure mathematical Python model translated directly to JavaScript for instant edge-computing in the browser.
- **Dashboard**: React, Recharts (for live data visualization), React Three Fiber (for 3D Kiln visualization).
- **Styling**: Custom CSS with modern Glassmorphism aesthetics and fully responsive mobile layout.

*This project proves that with the right combination of domain expertise (mechanical simulations) and software engineering, we can build practical, scalable early-warning models that bridge the gap between academic research and real-world industrial reliability.*
