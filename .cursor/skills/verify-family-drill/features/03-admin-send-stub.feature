Feature: Admin send stub
  Scenario: Sending creates an attempt
    Given I open "/admin"
    When I send Maya a surprise drill
    Then Maya's sent count increases by one
