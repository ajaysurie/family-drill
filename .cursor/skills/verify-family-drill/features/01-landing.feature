Feature: Landing
  Scenario: A visitor understands the product
    When I open "/"
    Then I see "Family Drill"
    And the page explains household-agreed surprise practice
