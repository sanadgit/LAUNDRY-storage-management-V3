import SortingPage from './Sorting';

export default function ClothesSortingPage() {
  // Note: This wrapper is the first structural split before moving clothes-sorting panels out of Sorting.tsx.
  return <SortingPage workflow="sorting" showWorkflowTabs={false} />;
}
