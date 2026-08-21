import fs from 'fs';
import path from 'path';

const css = `

/* Instructions Screen Styles */
.instructionsContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: var(--bg-gradient);
}

.instructionsCard {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 800px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.instructionsTitle {
  font-size: 2rem;
  color: var(--text-dark);
  text-align: center;
  margin-bottom: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.detailsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.detailBox {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detailLabel {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.detailValue {
  font-size: 1.1rem;
  color: var(--primary-dark);
  font-weight: 700;
}

.rulesSection {
  background: rgba(239, 68, 68, 0.05);
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(239, 68, 68, 0.1);
  margin-bottom: 2.5rem;
}

.rulesSection h3 {
  color: var(--text-dark);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.rulesSection ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.rulesSection li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-regular);
  line-height: 1.6;
}

.rulesSection li::before {
  content: '•';
  color: var(--primary);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.warningList li::before {
  color: #ef4444;
}

.startBtn {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
}

.startBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
}
`;

fs.appendFileSync(path.join(__dirname, '../client/src/pages/TestInterface.module.css'), css);
console.log('Appended styles successfully');
