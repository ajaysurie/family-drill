Feature: Household agreement
  Scenario: The seeded agreement is visible
    When I open "/household"
    Then the agreement is active
    And I see Maya, Leo, and Ruth
