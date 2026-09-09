Feature: Deliberate drill scoring
  Scenario: Viewing is not scoring but confirmation is
    Given Leo's lure engagement count is recorded from "/admin"
    When I open "/d/drill-leo"
    Then the lesson is revealed immediately
    And Leo's lure engagement count has not changed
    When I choose "I opened this from the email"
    Then the confirmation is visible
    And Leo's lure engagement count increases by one
