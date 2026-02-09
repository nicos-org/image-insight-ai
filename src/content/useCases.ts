export interface UseCase {
  id: string;
  name: string;
  folder: string;
}

export const useCases: UseCase[] = [
  { id: "test_a", name: "Test A", folder: "use_case_Test_A" },
  { id: "test_b", name: "Test B", folder: "use_case_Test_B" },
];
