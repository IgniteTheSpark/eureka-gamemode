import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeProvider, useGameMode } from "../gamemodeStore";
import { AssetPickerSheet } from "../overlays/AssetPickerSheet";

function Opener() {
  const g = useGameMode();
  return <button data-testid="openPicker" onClick={() => g.openPicker()} />;
}

test("dismiss via ✕ clears selection so reopening shows no selected rows", () => {
  render(
    <GameModeProvider>
      <Opener />
      <AssetPickerSheet />
    </GameModeProvider>
  );

  // Open picker
  fireEvent.click(screen.getByTestId("openPicker"));

  // Click the first row — it should gain class "sel"
  const firstRow = screen.getByTestId("pk-row-0");
  fireEvent.click(firstRow);
  expect(firstRow).toHaveClass("sel");

  // Dismiss via ✕
  fireEvent.click(screen.getByTestId("pk-x"));

  // Reopen
  fireEvent.click(screen.getByTestId("openPicker"));

  // No row should be selected
  const rows = screen.getAllByTestId(/^pk-row-/);
  rows.forEach((row) => {
    expect(row).not.toHaveClass("sel");
  });
});
