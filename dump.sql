--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: credit_card_promotions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA credit_card_promotions;


ALTER SCHEMA credit_card_promotions OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: promotion_eligibility; Type: TABLE; Schema: credit_card_promotions; Owner: postgres
--

CREATE TABLE credit_card_promotions.promotion_eligibility (
    id integer NOT NULL,
    age integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE credit_card_promotions.promotion_eligibility OWNER TO postgres;

--
-- Name: promotion_eligibility_id_seq; Type: SEQUENCE; Schema: credit_card_promotions; Owner: postgres
--

CREATE SEQUENCE credit_card_promotions.promotion_eligibility_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE credit_card_promotions.promotion_eligibility_id_seq OWNER TO postgres;

--
-- Name: promotion_eligibility_id_seq; Type: SEQUENCE OWNED BY; Schema: credit_card_promotions; Owner: postgres
--

ALTER SEQUENCE credit_card_promotions.promotion_eligibility_id_seq OWNED BY credit_card_promotions.promotion_eligibility.id;


--
-- Name: promotions; Type: TABLE; Schema: credit_card_promotions; Owner: postgres
--

CREATE TABLE credit_card_promotions.promotions (
    id integer NOT NULL,
    name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE credit_card_promotions.promotions OWNER TO postgres;

--
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: credit_card_promotions; Owner: postgres
--

CREATE SEQUENCE credit_card_promotions.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE credit_card_promotions.promotions_id_seq OWNER TO postgres;

--
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: credit_card_promotions; Owner: postgres
--

ALTER SEQUENCE credit_card_promotions.promotions_id_seq OWNED BY credit_card_promotions.promotions.id;


--
-- Name: er_relationships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.er_relationships (
    id integer NOT NULL,
    database_name text NOT NULL,
    from_table_id integer NOT NULL,
    from_column text NOT NULL,
    to_table_id integer NOT NULL,
    to_column text NOT NULL,
    cardinality text NOT NULL,
    relationship_type text DEFAULT 'foreign_key'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT er_relationships_cardinality_check CHECK ((cardinality = ANY (ARRAY['one-to-one'::text, 'one-to-many'::text, 'many-to-one'::text])))
);


ALTER TABLE public.er_relationships OWNER TO postgres;

--
-- Name: TABLE er_relationships; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.er_relationships IS 'Entity-relationship mappings between tables';


--
-- Name: COLUMN er_relationships.database_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.database_name IS 'Name of the database containing the relationship';


--
-- Name: COLUMN er_relationships.from_table_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.from_table_id IS 'Source table of the relationship';


--
-- Name: COLUMN er_relationships.from_column; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.from_column IS 'Source column name';


--
-- Name: COLUMN er_relationships.to_table_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.to_table_id IS 'Target table of the relationship';


--
-- Name: COLUMN er_relationships.to_column; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.to_column IS 'Target column name';


--
-- Name: COLUMN er_relationships.cardinality; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.cardinality IS 'Relationship cardinality';


--
-- Name: COLUMN er_relationships.relationship_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.relationship_type IS 'Type of relationship (foreign_key, etc.)';


--
-- Name: COLUMN er_relationships.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.created_at IS 'Timestamp when relationship was created';


--
-- Name: er_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.er_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.er_relationships_id_seq OWNER TO postgres;

--
-- Name: er_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.er_relationships_id_seq OWNED BY public.er_relationships.id;


--
-- Name: lobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lobs (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.lobs OWNER TO postgres;

--
-- Name: lobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lobs_id_seq OWNER TO postgres;

--
-- Name: lobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lobs_id_seq OWNED BY public.lobs.id;


--
-- Name: logical_databases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logical_databases (
    id integer NOT NULL,
    name text NOT NULL,
    subject_area_id integer
);


ALTER TABLE public.logical_databases OWNER TO postgres;

--
-- Name: logical_databases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logical_databases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logical_databases_id_seq OWNER TO postgres;

--
-- Name: logical_databases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logical_databases_id_seq OWNED BY public.logical_databases.id;


--
-- Name: subject_areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_areas (
    id integer NOT NULL,
    name text NOT NULL,
    lob_id integer
);


ALTER TABLE public.subject_areas OWNER TO postgres;

--
-- Name: subject_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subject_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_areas_id_seq OWNER TO postgres;

--
-- Name: subject_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subject_areas_id_seq OWNED BY public.subject_areas.id;


--
-- Name: tables_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables_metadata (
    id integer NOT NULL,
    name text NOT NULL,
    schema_name text DEFAULT 'public'::text,
    database_id integer
);


ALTER TABLE public.tables_metadata OWNER TO postgres;

--
-- Name: tables_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tables_metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tables_metadata_id_seq OWNER TO postgres;

--
-- Name: tables_metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tables_metadata_id_seq OWNED BY public.tables_metadata.id;


--
-- Name: promotion_eligibility id; Type: DEFAULT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions.promotion_eligibility ALTER COLUMN id SET DEFAULT nextval('credit_card_promotions.promotion_eligibility_id_seq'::regclass);


--
-- Name: promotions id; Type: DEFAULT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions.promotions ALTER COLUMN id SET DEFAULT nextval('credit_card_promotions.promotions_id_seq'::regclass);


--
-- Name: er_relationships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships ALTER COLUMN id SET DEFAULT nextval('public.er_relationships_id_seq'::regclass);


--
-- Name: lobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs ALTER COLUMN id SET DEFAULT nextval('public.lobs_id_seq'::regclass);


--
-- Name: logical_databases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases ALTER COLUMN id SET DEFAULT nextval('public.logical_databases_id_seq'::regclass);


--
-- Name: subject_areas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas ALTER COLUMN id SET DEFAULT nextval('public.subject_areas_id_seq'::regclass);


--
-- Name: tables_metadata id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata ALTER COLUMN id SET DEFAULT nextval('public.tables_metadata_id_seq'::regclass);


--
-- Data for Name: promotion_eligibility; Type: TABLE DATA; Schema: credit_card_promotions; Owner: postgres
--

COPY credit_card_promotions.promotion_eligibility (id, age, name, created_at) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: credit_card_promotions; Owner: postgres
--

COPY credit_card_promotions.promotions (id, name, created_at) FROM stdin;
1	Cashback Carnival	2025-07-07 12:50:54.304308
2	Festive EMI Offer	2025-07-07 12:50:54.304308
3	Travel Miles Booster	2025-07-07 12:50:54.304308
4	Dining Delights	2025-07-07 12:50:54.304308
5	Summer Spend Bonus	2025-07-07 12:50:54.304308
6	Weekend Swipe Win	2025-07-07 12:50:54.304308
7	Fuel Freedom Deal	2025-07-07 12:50:54.304308
8	Anniversary Offer	2025-07-07 12:50:54.304308
9	Welcome Gift Plan	2025-07-07 12:50:54.304308
10	Online Shopping Spree	2025-07-07 12:50:54.304308
\.


--
-- Data for Name: er_relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.er_relationships (id, database_name, from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, created_at) FROM stdin;
80	credit_card_promotions	116	age	115	name	one-to-many	foreign_key	2025-07-07 12:38:26.777554
\.


--
-- Data for Name: lobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lobs (id, name) FROM stdin;
1	Branded cards
2	CRS
3	Deposits
4	Investments
5	Personal loan
6	Mortgage
7	Customer
8	Channel
9	Others
12	Adsana
13	New LOB
\.


--
-- Data for Name: logical_databases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logical_databases (id, name, subject_area_id) FROM stdin;
40	credit_card_promotions	39
\.


--
-- Data for Name: subject_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_areas (id, name, lob_id) FROM stdin;
39	Accounts	1
\.


--
-- Data for Name: tables_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables_metadata (id, name, schema_name, database_id) FROM stdin;
115	promotions	credit_card_promotions	40
116	promotion_eligibility	credit_card_promotions	40
\.


--
-- Name: promotion_eligibility_id_seq; Type: SEQUENCE SET; Schema: credit_card_promotions; Owner: postgres
--

SELECT pg_catalog.setval('credit_card_promotions.promotion_eligibility_id_seq', 1, false);


--
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: credit_card_promotions; Owner: postgres
--

SELECT pg_catalog.setval('credit_card_promotions.promotions_id_seq', 1, false);


--
-- Name: er_relationships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.er_relationships_id_seq', 82, true);


--
-- Name: lobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lobs_id_seq', 13, true);


--
-- Name: logical_databases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logical_databases_id_seq', 40, true);


--
-- Name: subject_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_areas_id_seq', 39, true);


--
-- Name: tables_metadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tables_metadata_id_seq', 119, true);


--
-- Name: promotion_eligibility promotion_eligibility_pkey; Type: CONSTRAINT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions.promotion_eligibility
    ADD CONSTRAINT promotion_eligibility_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: er_relationships er_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_pkey PRIMARY KEY (id);


--
-- Name: lobs lobs_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs
    ADD CONSTRAINT lobs_name_key UNIQUE (name);


--
-- Name: lobs lobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs
    ADD CONSTRAINT lobs_pkey PRIMARY KEY (id);


--
-- Name: logical_databases logical_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases
    ADD CONSTRAINT logical_databases_pkey PRIMARY KEY (id);


--
-- Name: subject_areas subject_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas
    ADD CONSTRAINT subject_areas_pkey PRIMARY KEY (id);


--
-- Name: tables_metadata tables_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata
    ADD CONSTRAINT tables_metadata_pkey PRIMARY KEY (id);


--
-- Name: idx_er_relationships_database_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_database_name ON public.er_relationships USING btree (database_name);


--
-- Name: idx_er_relationships_from_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_from_table_id ON public.er_relationships USING btree (from_table_id);


--
-- Name: idx_er_relationships_to_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_to_table_id ON public.er_relationships USING btree (to_table_id);


--
-- Name: er_relationships er_relationships_from_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_from_table_id_fkey FOREIGN KEY (from_table_id) REFERENCES public.tables_metadata(id) ON DELETE CASCADE;


--
-- Name: er_relationships er_relationships_to_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_to_table_id_fkey FOREIGN KEY (to_table_id) REFERENCES public.tables_metadata(id) ON DELETE CASCADE;


--
-- Name: logical_databases logical_databases_subject_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases
    ADD CONSTRAINT logical_databases_subject_area_id_fkey FOREIGN KEY (subject_area_id) REFERENCES public.subject_areas(id) ON DELETE CASCADE;


--
-- Name: subject_areas subject_areas_lob_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas
    ADD CONSTRAINT subject_areas_lob_id_fkey FOREIGN KEY (lob_id) REFERENCES public.lobs(id) ON DELETE CASCADE;


--
-- Name: tables_metadata tables_metadata_database_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata
    ADD CONSTRAINT tables_metadata_database_id_fkey FOREIGN KEY (database_id) REFERENCES public.logical_databases(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

