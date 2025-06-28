import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Columns,
  Building2,
  Target,
  Server,
} from "lucide-react";

const FilterBar = () => {
  const [hoveredLob, setHoveredLob] = useState(null);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [selectedPath, setSelectedPath] = useState({
    lob: null,
    subject: null,
    database: null,
    table: null,
  });

  const businessData = {
    "Branded Cards": {
      Accounts: {
        databases: ["card_accounts_db", "card_profile_db"],
        tables: ["card_accounts", "card_holders", "card_limits"],
      },
      Payments: {
        databases: ["card_payments_db", "transaction_db"],
        tables: ["card_transactions", "payments", "authorizations"],
      },
      Fraud: {
        databases: ["fraud_detection_db", "security_db"],
        tables: ["fraud_alerts", "suspicious_transactions", "blocked_cards"],
      },
      Collections: {
        databases: ["collections_db", "delinquency_db"],
        tables: ["collection_cases", "payment_plans", "recovery_actions"],
      },
    },
    CRS: {
      Customer: {
        databases: ["crs_customer_db", "profile_db"],
        tables: ["customer_profiles", "contact_info", "preferences"],
      },
      Compliance: {
        databases: ["crs_compliance_db", "regulatory_db"],
        tables: ["compliance_reports", "tax_reporting", "regulatory_filings"],
      },
      Risk: {
        databases: ["crs_risk_db", "assessment_db"],
        tables: ["risk_assessments", "credit_scores", "risk_factors"],
      },
    },
    Deposits: {
      Accounts: {
        databases: ["deposit_accounts_db", "savings_db"],
        tables: ["savings_accounts", "checking_accounts", "account_balances"],
      },
      "Money Movement": {
        databases: ["transfer_db", "wire_db"],
        tables: ["transfers", "wire_transfers", "ach_transactions"],
      },
      Rate: {
        databases: ["interest_rates_db", "pricing_db"],
        tables: ["interest_rates", "rate_tiers", "promotional_rates"],
      },
      Fees: {
        databases: ["fee_structure_db", "charges_db"],
        tables: ["fee_schedule", "account_fees", "fee_waivers"],
      },
    },
    Investments: {
      Accounts: {
        databases: ["investment_accounts_db", "portfolio_db"],
        tables: ["investment_accounts", "portfolios", "holdings"],
      },
      Risk: {
        databases: ["investment_risk_db", "market_risk_db"],
        tables: ["risk_profiles", "market_risks", "portfolio_risks"],
      },
      Finance: {
        databases: ["investment_finance_db", "valuation_db"],
        tables: ["portfolio_valuations", "performance_metrics", "returns"],
      },
    },
    "Personal Loan": {
      Accounts: {
        databases: ["loan_accounts_db", "borrower_db"],
        tables: ["loan_accounts", "borrower_profiles", "loan_terms"],
      },
      Risk: {
        databases: ["loan_risk_db", "credit_db"],
        tables: ["credit_assessments", "default_risks", "loan_grades"],
      },
      Collections: {
        databases: ["loan_collections_db", "recovery_db"],
        tables: ["delinquent_loans", "collection_efforts", "recovery_plans"],
      },
      Servicing: {
        databases: ["loan_servicing_db", "payment_db"],
        tables: ["loan_payments", "payment_schedules", "servicing_records"],
      },
    },
    Mortgage: {
      Accounts: {
        databases: ["mortgage_accounts_db", "property_db"],
        tables: ["mortgage_accounts", "property_details", "loan_documents"],
      },
      Collateral: {
        databases: ["collateral_db", "appraisal_db"],
        tables: ["property_collateral", "appraisals", "collateral_valuations"],
      },
      Servicing: {
        databases: ["mortgage_servicing_db", "escrow_db"],
        tables: ["mortgage_payments", "escrow_accounts", "servicing_transfers"],
      },
      Risk: {
        databases: ["mortgage_risk_db", "ltv_db"],
        tables: ["loan_to_value", "mortgage_risks", "default_probabilities"],
      },
    },
    Customer: {
      Customer: {
        databases: ["customer_master_db", "demographics_db"],
        tables: ["customer_master", "demographics", "customer_segments"],
      },
      "Customer Communication": {
        databases: ["communication_db", "notification_db"],
        tables: ["communications", "notifications", "preferences"],
      },
      Acquisitions: {
        databases: ["acquisition_db", "prospect_db"],
        tables: ["prospects", "acquisition_campaigns", "conversion_metrics"],
      },
      Marketing: {
        databases: ["marketing_db", "campaign_db"],
        tables: ["campaigns", "customer_responses", "marketing_metrics"],
      },
    },
    Channel: {
      Channels: {
        databases: ["channel_db", "interaction_db"],
        tables: [
          "channel_interactions",
          "channel_preferences",
          "usage_patterns",
        ],
      },
      Operations: {
        databases: ["channel_ops_db", "performance_db"],
        tables: [
          "channel_performance",
          "operational_metrics",
          "efficiency_reports",
        ],
      },
      "Customer Communication": {
        databases: ["channel_comm_db", "message_db"],
        tables: ["channel_messages", "communication_logs", "response_tracking"],
      },
    },
    Others: {
      Reference: {
        databases: ["reference_db", "lookup_db"],
        tables: ["reference_data", "lookup_tables", "master_data"],
      },
      Compliance: {
        databases: ["general_compliance_db", "audit_db"],
        tables: ["compliance_records", "audit_trails", "regulatory_reports"],
      },
      Operations: {
        databases: ["operations_db", "workflow_db"],
        tables: ["operational_data", "workflow_instances", "process_metrics"],
      },
      Disputes: {
        databases: ["disputes_db", "resolution_db"],
        tables: ["dispute_cases", "resolution_actions", "dispute_outcomes"],
      },
      Complaints: {
        databases: ["complaints_db", "feedback_db"],
        tables: [
          "customer_complaints",
          "complaint_resolutions",
          "feedback_analysis",
        ],
      },
      Merchant: {
        databases: ["merchant_db", "transaction_processing_db"],
        tables: [
          "merchant_accounts",
          "merchant_transactions",
          "settlement_data",
        ],
      },
      "Account Promotions": {
        databases: ["promotions_db", "offers_db"],
        tables: [
          "promotional_offers",
          "account_promotions",
          "promotion_results",
        ],
      },
    },
  };

  const handleLobSelect = (lob) => {
    setSelectedPath({
      lob,
      subject: null,
      database: null,
      table: null,
    });
  };

  const handleSubjectSelect = (lob, subject) => {
    setSelectedPath({
      lob,
      subject,
      database: null,
      table: null,
    });
  };

  const handleDatabaseSelect = (database) => {
    setSelectedPath({
      ...selectedPath,
      database,
      table: null,
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
                            onMouseEnter={() => {
                              setHoveredLob(lob);
                              setHoveredSubject(subject);
                            }}
                            onMouseLeave={() => {
                              setHoveredSubject(null);
                            }}
                          >
                            <div className="py-2">
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Databases
                              </div>
                              {businessData[lob][subject].databases.map(
                                (database) => (
                                  <button
                                    key={database}
                                    onClick={() =>
                                      handleDatabaseSelect(database)
                                    }
                                    className={`w-full flex items-center px-4 py-3 text-sm text-left transition-colors ${
                                      selectedPath.database === database
                                        ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <Database className="w-4 h-4 mr-3 text-gray-400" />
                                    {database}
                                  </button>
                                )
                              )}

                              <div className="border-t border-gray-100 mt-2 pt-2">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Tables
                                </div>
                                {businessData[lob][subject].tables.map(
                                  (table) => (
                                    <button
                                      key={table}
                                      onClick={() =>
                                        setSelectedPath({
                                          ...selectedPath,
                                          table,
                                        })
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
