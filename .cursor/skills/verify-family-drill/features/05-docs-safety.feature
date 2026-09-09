Feature: Safety documentation
  Scenario: Optional safety docs are healthy when present
    When I request "/docs/safety"
    Then a 404 skips this scenario
    But if it exists it loads and uses Family Drill or household safety language
