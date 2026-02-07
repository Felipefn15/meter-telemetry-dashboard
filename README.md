# Meter Telemetry Dashboard

A Next.js application for processing and visualizing water meter telemetry data. This project demonstrates clean code principles, SOLID design patterns, and separation of concerns.

## Features

- **Data Processing**: Pure function-based processing of raw meter readings with support for:
  - Normal consecutive readings
  - Time gap handling with consumption distribution
  - Counter reset detection
  - Duplicate removal and data sanitization

- **Dashboard Overview**: 
  - Fleet-wide consumption summary
  - Total incidents tracking
  - Sortable meter table (by ID, consumption, incidents, status)
  - Status indicators (Normal / Has Incidents)

- **Meter Details Page**:
  - Hourly consumption charts
  - Flag breakdown visualization (Normal, Gap Estimated, Counter Reset)
  - Summary statistics
  - Raw data table

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **date-fns** for date manipulation
- **Jest** for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
meter-telemetry-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Overview page
│   └── meter/
│       └── [meterId]/
│           ├── page.tsx    # Meter detail page
│           └── not-found.tsx
├── components/
│   ├── SummaryCard.tsx     # Reusable summary card component
│   ├── MeterTable.tsx      # Sortable meter table
│   ├── ConsumptionChart.tsx # Main consumption chart
│   └── FlagBreakdownChart.tsx # Flag-based breakdown chart
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── processor.ts        # Core data processing logic (pure function)
│   ├── processor.test.ts   # Unit tests for processor
│   └── utils.ts            # Utility functions for summaries
├── data/
│   └── readings.json       # Raw meter readings data
└── test/
    └── setup.ts            # Jest configuration
```

## Business Logic

### Processing Rules

1. **Delta Calculation**: Consumption is calculated as the difference between consecutive readings (Current - Previous).

2. **Bucketing**: The consumption delta is attributed to the hour bucket of the **previous** reading. For example, readings at 10:03 and 11:07 result in the delta being assigned to the 10:00 hour bucket.

3. **Gap Handling**: When readings skip hours (e.g., 10:07 to 14:02), the total consumption is distributed equally across all hours in the interval (10, 11, 12, 13). These readings are flagged as `gap_estimated`.

4. **Counter Reset**: If a reading's cumulative volume is less than the previous reading, a counter reset is assumed. The delta is the current volume value, and the reading is flagged as `counter_reset`.

5. **Sanitization**: Duplicate readings (same meterId and timestamp) are removed. All readings are sorted by timestamp and meterId.

## Trade-offs

### 1. Gap Distribution Strategy

**Decision**: Distribute consumption equally across all hours in a gap interval.

**Rationale**: This approach provides a simple, predictable way to handle missing data without complex interpolation algorithms. It ensures all consumption is accounted for while clearly flagging estimated values.

**Trade-offs**:
- **Pros**: Simple implementation, predictable behavior, all consumption accounted for
- **Cons**: May not reflect actual consumption patterns (e.g., if consumption is higher during certain hours)
- **Alternative Considered**: Linear interpolation or time-weighted distribution, but rejected for complexity vs. benefit

### 2. Counter Reset Detection

**Decision**: Simple comparison (Current < Previous) to detect resets.

**Rationale**: For this use case, a simple comparison is sufficient. The counter reset flag clearly indicates when this occurs, allowing downstream systems to handle it appropriately.

**Trade-offs**:
- **Pros**: Simple, fast, easy to understand and test
- **Cons**: Doesn't handle edge cases like 32-bit integer overflow (e.g., 2,147,483,647 → 0), but this is acceptable for the current data range
- **Alternative Considered**: Integer overflow detection, but the current data doesn't require it

### 3. Pure Function Architecture

**Decision**: `processor.ts` is a pure function with no React dependencies.

**Rationale**: This ensures the core business logic is testable, reusable, and can be easily moved to a backend service or worker thread if needed.

**Trade-offs**:
- **Pros**: Highly testable, no side effects, easy to reason about, portable
- **Cons**: Slightly more verbose (need to pass all data as parameters), but the benefits outweigh this

### 4. Client vs Server Components

**Decision**: Use Server Components for data fetching/processing, Client Components only for interactivity (sorting, charts).

**Rationale**: Leverages Next.js App Router benefits - reduced JavaScript bundle size, better SEO, faster initial load.

**Trade-offs**:
- **Pros**: Better performance, smaller bundles, SEO-friendly
- **Cons**: Some components need to be Client Components (charts, sorting), but this is minimal

### 5. Chart Library Choice

**Decision**: Use Recharts instead of Chart.js or D3 directly.

**Rationale**: Recharts provides a good balance between React integration, ease of use, and customization. It's well-maintained and has good TypeScript support.

**Trade-offs**:
- **Pros**: React-native, good TypeScript support, responsive by default
- **Cons**: Larger bundle size than Chart.js, less flexible than raw D3
- **Alternative Considered**: Chart.js with react-chartjs-2, but Recharts has better React integration

### 6. Testing Strategy

**Decision**: Focus on unit tests for the processor logic, minimal UI tests.

**Rationale**: The processor contains the critical business logic and is the most error-prone. UI components are relatively simple and can be validated through manual testing.

**Trade-offs**:
- **Pros**: Fast test suite, high coverage of critical logic, easy to maintain
- **Cons**: Less coverage of UI components, but acceptable for this project scope
- **Alternative Considered**: Full E2E tests with Playwright, but overkill for this project

### 7. Data Loading

**Decision**: Load data from static JSON file instead of API/database.

**Rationale**: Simplifies the project setup and focuses on the core challenge (data processing and visualization). In production, this would be replaced with an API call.

**Trade-offs**:
- **Pros**: Simple, no backend required, fast development
- **Cons**: Not production-ready, but appropriate for a technical challenge
- **Future**: Would be replaced with API calls, possibly with React Query for caching/loading states

## Future Improvements

- Add loading states and skeletons (currently data loads instantly)
- Implement filtering/search functionality
- Add export functionality (CSV, PDF)
- Real-time data updates via WebSocket
- Historical data comparison
- Alert system for anomalies
- User authentication and multi-tenant support
- API integration for real data sources

## License

This project is created for a technical challenge demonstration.
