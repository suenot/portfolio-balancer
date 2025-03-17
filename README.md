# Portfolio Balancer

## Project Description

Portfolio Balancer is a web application designed for visualizing, analyzing, and balancing investment portfolios. The application allows users to:

1. Visualize the current structure of their investment portfolio
2. Set a desired structure in percentages (target asset allocation)
3. Receive recommendations for transactions needed to achieve the desired structure
4. View the portfolio in different visual representations

## Technical Features

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Data Visualization**: 
  - ReactFlow (for tree graphs)
  - D3.js (for interactive visualizations)
  - Cytoscape.js (for complex graph structures)
  - JSON representation (raw data format)

## Data Structure

All schemas and visualizations are built from a single JSON data source. The basic structure looks like this:

```typescript
interface AssetNode {
  id: string;
  name: string;
  value: number; // current amount
  quoteId?: string; // currency identifier (USD, RUB, etc.)
  percentage?: number; // current percentage of parent
  desiredPercentage?: number; // desired percentage of parent
  diffValue?: number; // difference between current and desired value
  children?: AssetNode[]; // child assets
  parentId?: string; // parent node id
  operation?: 'buy' | 'sell' | 'hold'; // operation for balancing
}
```

## Available Visualizations

The application supports the following types of visualizations, all built from the same JSON source:

1. **ReactFlow** - tree diagram with interactive nodes
2. **D3.js** - flexible interactive visualizations
3. **Cytoscape.js** - graph of relationships between assets
4. **JSON** - view of raw data in JSON format

## Functionality

- Loading and editing the current portfolio structure
- Creating and editing the target portfolio structure
- Automatic calculation of necessary actions for balancing
- Switching between different visual representations
- Representation of differences between current and target portfolios
- Interactive analysis of portfolio structure

## Running the Project

```bash
# Install dependencies
npm install

# Run the project in development mode
npm run dev

# Build the project
npm run build

# Run the built project
npm run start
```

## Development Prospects

- Adding support for importing data from brokerage reports
- Advanced analytics considering risk and return
- Portfolio optimization based on various strategies
- Integration with APIs for real-time quotes
- Mobile version of the application 