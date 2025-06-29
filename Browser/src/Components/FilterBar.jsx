import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Building2,
  Target,
} from "lucide-react";

const businessData = {
  "Branded Cards": {
    Accounts: {
      databases: {
        card_accounts_db: ["card_accounts", "account_status", "card_issuance"],
        card_profile_db: ["card_holders", "cardholder_details", "card_limits"],
      },
    },
    Payments: {
      databases: {
        card_payments_db: ["card_transactions", "payment_history", "transaction_fees"],
        transaction_db: ["payments", "authorizations", "settlement_records"],
      },
    },
    Fraud: {
      databases: {
        fraud_detection_db: ["fraud_alerts", "fraud_patterns", "risk_scoring"],
        security_db: ["suspicious_transactions", "blocked_cards", "security_logs"],
      },
    },
    Collections: {
      databases: {
        collections_db: ["collection_cases", "collector_assignments", "case_status"],
        delinquency_db: ["payment_plans", "recovery_actions", "delinquent_accounts"],
      },
    },
  },
  CRS: {
    Customer: {
      databases: {
        crs_customer_db: ["customer_profiles", "kyc_documents", "onboarding_data"],
        profile_db: ["contact_info", "preferences", "communication_history"],
      },
    },
    Compliance: {
      databases: {
        crs_compliance_db: ["compliance_reports", "audit_findings", "remediation_actions"],
        regulatory_db: ["tax_reporting", "regulatory_filings", "compliance_calendar"],
      },
    },
    Risk: {
      databases: {
        crs_risk_db: ["risk_assessments", "risk_models", "stress_testing"],
        assessment_db: ["credit_scores", "risk_factors", "portfolio_metrics"],
      },
    },
  },
  Deposits: {
    Accounts: {
      databases: {
        deposit_accounts_db: ["savings_accounts", "account_opening", "account_closure"],
        savings_db: ["checking_accounts", "account_balances", "interest_calculations"],
      },
    },
    "Money Movement": {
      databases: {
        transfer_db: ["transfers", "transfer_limits", "beneficiary_management"],
        wire_db: ["wire_transfers", "ach_transactions", "international_transfers"],
      },
    },
    Rate: {
      databases: {
        interest_rates_db: ["interest_rates", "rate_history", "rate_changes"],
        pricing_db: ["rate_tiers", "promotional_rates", "pricing_models"],
      },
    },
    Fees: {
      databases: {
        fee_structure_db: ["fee_schedule", "fee_types", "fee_calculations"],
        charges_db: ["account_fees", "fee_waivers", "fee_reversals"],
      },
    },
  },
  Investments: {
    Accounts: {
      databases: {
        investment_accounts_db: ["investment_accounts", "account_types", "tax_wrappers"],
        portfolio_db: ["portfolios", "holdings", "asset_allocation"],
      },
    },
    Risk: {
      databases: {
        investment_risk_db: ["risk_profiles", "risk_tolerance", "risk_questionnaires"],
        market_risk_db: ["market_risks", "portfolio_risks", "var_calculations"],
      },
    },
    Finance: {
      databases: {
        investment_finance_db: ["portfolio_valuations", "nav_calculations", "cost_basis"],
        valuation_db: ["performance_metrics", "returns", "benchmarking"],
      },
    },
  },
  "Personal Loan": {
    Accounts: {
      databases: {
        loan_accounts_db: ["loan_accounts", "loan_applications", "approval_workflow"],
        borrower_db: ["borrower_profiles", "loan_terms", "repayment_schedules"],
      },
    },
    Risk: {
      databases: {
        loan_risk_db: ["credit_assessments", "underwriting_decisions", "risk_pricing"],
        credit_db: ["default_risks", "loan_grades", "credit_bureau_data"],
      },
    },
    Collections: {
      databases: {
        loan_collections_db: ["delinquent_loans", "collection_strategies", "workout_plans"],
        recovery_db: ["collection_efforts", "recovery_plans", "charge_offs"],
      },
    },
    Servicing: {
      databases: {
        loan_servicing_db: ["loan_payments", "payment_processing", "escrow_management"],
        payment_db: ["payment_schedules", "servicing_records", "payment_history"],
      },
    },
  },
  Mortgage: {
    Accounts: {
      databases: {
        mortgage_accounts_db: ["mortgage_accounts", "loan_origination", "closing_documents"],
        property_db: ["property_details", "loan_documents", "title_information"],
      },
    },
    Collateral: {
      databases: {
        collateral_db: ["property_collateral", "collateral_tracking", "lien_management"],
        appraisal_db: ["appraisals", "collateral_valuations", "property_inspections"],
      },
    },
    Servicing: {
      databases: {
        mortgage_servicing_db: ["mortgage_payments", "payment_application", "loan_modifications"],
        escrow_db: ["escrow_accounts", "servicing_transfers", "tax_insurance_payments"],
      },
    },
    Risk: {
      databases: {
        mortgage_risk_db: ["loan_to_value", "mortgage_insurance", "risk_monitoring"],
        ltv_db: ["mortgage_risks", "default_probabilities", "loss_given_default"],
      },
    },
  },
  Customer: {
    Customer: {
      databases: {
        customer_master_db: ["customer_master", "customer_hierarchy", "relationship_mapping"],
        demographics_db: ["demographics", "customer_segments", "behavioral_data"],
      },
    },
    "Customer Communication": {
      databases: {
        communication_db: ["communications", "message_templates", "delivery_tracking"],
        notification_db: ["notifications", "preferences", "opt_in_management"],
      },
    },
    Acquisitions: {
      databases: {
        acquisition_db: ["prospects", "lead_scoring", "conversion_tracking"],
        prospect_db: ["acquisition_campaigns", "conversion_metrics", "channel_attribution"],
      },
    },
    Marketing: {
      databases: {
        marketing_db: ["campaigns", "campaign_performance", "a_b_testing"],
        campaign_db: ["customer_responses", "marketing_metrics", "roi_analysis"],
      },
    },
  },
  Channel: {
    Channels: {
      databases: {
        channel_db: ["channel_interactions", "session_data", "user_journeys"],
        interaction_db: ["channel_preferences", "usage_patterns", "feature_usage"],
      },
    },
    Operations: {
      databases: {
        channel_ops_db: ["channel_performance", "uptime_monitoring", "error_tracking"],
        performance_db: ["operational_metrics", "efficiency_reports", "sla_monitoring"],
      },
    },
    "Customer Communication": {
      databases: {
        channel_comm_db: ["channel_messages", "cross_channel_tracking", "message_routing"],
        message_db: ["communication_logs", "response_tracking", "escalation_management"],
      },
    },
  },
  Others: {
    Reference: {
      databases: {
        reference_db: ["reference_data", "code_tables", "configuration_settings"],
        lookup_db: ["lookup_tables", "master_data", "data_dictionary"],
      },
    },
    Compliance: {
      databases: {
        general_compliance_db: ["compliance_records", "policy_management", "training_records"],
        audit_db: ["audit_trails", "regulatory_reports", "examination_findings"],
      },
    },
    Operations: {
      databases: {
        operations_db: ["operational_data", "batch_processing", "system_monitoring"],
        workflow_db: ["workflow_instances", "process_metrics", "automation_rules"],
      },
    },
    Disputes: {
      databases: {
        disputes_db: ["dispute_cases", "dispute_categories", "investigation_notes"],
        resolution_db: ["resolution_actions", "dispute_outcomes", "chargeback_management"],
      },
    },
    Complaints: {
      databases: {
        complaints_db: ["customer_complaints", "complaint_categories", "escalation_tracking"],
        feedback_db: ["complaint_resolutions", "feedback_analysis", "satisfaction_surveys"],
      },
    },
    Merchant: {
      databases: {
        merchant_db: ["merchant_accounts", "merchant_onboarding", "merchant_profiles"],
        transaction_processing_db: ["merchant_transactions", "settlement_data", "fee_calculations"],
      },
    },
    "Account Promotions": {
      databases: {
        promotions_db: ["promotional_offers", "offer_management", "eligibility_rules"],
        offers_db: ["account_promotions", "promotion_results", "performance_tracking"],
      },
    },
  },
};

const FilterBar = ({ selectedPath, onSelect, setSelectedPath }) => {
  const [hoveredLob, setHoveredLob] = useState(null);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [hoveredDatabase, setHoveredDatabase] = useState(null);

  const handleLobSelect = (lob) => {
    onSelect({ lob, subject: null, database: null, table: null });
    setHoveredLob(null);
    setHoveredSubject(null);
    setHoveredDatabase(null);
  };

  const handleSubjectSelect = (lob, subject) => {
    onSelect({ lob, subject, database: null, table: null });
    setHoveredSubject(subject);
    setHoveredDatabase(null);
  };

  const handleDatabaseSelect = (lob, subject, database) => {
    onSelect({ lob, subject, database, table: null });
    setHoveredDatabase(database);
  };

  const handleTableSelect = (lob, subject, database, table) => {
    setSelectedPath({
      lob,
      subject,
      database,
      table,
    });
  };

  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      {/* Breadcrumb showing current selection */}
      {selectedPath.lob && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center text-sm text-blue-700">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="font-medium">{selectedPath.lob}</span>
            {selectedPath.subject && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Target className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.subject}</span>
              </>
            )}
            {selectedPath.database && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Database className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.database}</span>
              </>
            )}
            {selectedPath.table && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Table className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.table}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="relative">
        <div className="flex items-center px-6 py-3 space-x-8">
          {Object.keys(businessData).map((lob) => (
            <div
              key={lob}
              className="relative"
              onMouseEnter={() => setHoveredLob(lob)}
              onMouseLeave={() => {
                setHoveredLob(null);
                setHoveredSubject(null);
                setHoveredDatabase(null);
              }}
            >
              <button
                onClick={() => handleLobSelect(lob)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPath.lob === lob
                    ? "bg-blue-600 text-white shadow-md"
                    : hoveredLob === lob
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {lob}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Subject Area Dropdown */}
              {hoveredLob === lob && (
                <div
                  className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  onMouseEnter={() => setHoveredLob(lob)}
                  onMouseLeave={() => {
                    setHoveredLob(null);
                    setHoveredSubject(null);
                    setHoveredDatabase(null);
                  }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Subject Areas
                    </div>
                    {Object.keys(businessData[lob]).map((subject) => (
                      <div
                        key={subject}
                        className="relative"
                        onMouseEnter={() => setHoveredSubject(subject)}
                      >
                        <button
                          onClick={() => handleSubjectSelect(lob, subject)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                            selectedPath.lob === lob &&
                            selectedPath.subject === subject
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                              : hoveredSubject === subject
                              ? "bg-gray-50 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-3 text-gray-400" />
                            {subject}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Database Dropdown */}
                        {hoveredSubject === subject && (
                          <div
                            className="absolute left-full -top-10 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                            onMouseEnter={() => setHoveredSubject(subject)}
                            onMouseLeave={() => {
                              setHoveredSubject(null);
                              setHoveredDatabase(null);
                            }}
                          >
                            <div className="py-2">
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Databases
                              </div>
                              {Object.keys(businessData[lob][subject].databases).map(
                                (database) => (
                                  <div
                                    key={database}
                                    className="relative"
                                    onMouseEnter={() => setHoveredDatabase(database)}
                                  >
                                    <button
                                      onClick={() =>
                                        handleDatabaseSelect(
                                          lob,
                                          subject,
                                          database
                                        )
                                      }
                                      className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                                        selectedPath.database === database
                                          ? "bg-purple-600 text-white shadow-md"
                                          : hoveredDatabase === database
                                          ? "bg-gray-50 text-gray-900"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <Database className="w-4 h-4 mr-3 text-gray-400" />
                                        {database}
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {/* Tables Dropdown */}
                                    {hoveredDatabase === database && (
                                      <div
                                        className="absolute left-full -top-10 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                        onMouseEnter={() => setHoveredDatabase(database)}
                                        onMouseLeave={() => setHoveredDatabase(null)}
                                      >
                                        <div className="py-2">
                                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Tables
                                          </div>
                                          {businessData[lob][subject].databases[database].map(
                                            (table) => (
                                              <button
                                                key={table}
                                                onClick={() =>
                                                  handleTableSelect(
                                                    lob,
                                                    subject,
                                                    database,
                                                    table
                                                  )
                                                }
                                                className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                                                  selectedPath.table === table
                                                    ? "bg-purple-50 text-purple-700"
                                                    : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                              >
                                                <Table className="w-4 h-4 mr-3 text-gray-400" />
                                                {table}
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;