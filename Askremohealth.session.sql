CREATE TYPE collection_method AS ENUM ('onsite', 'home');
CREATE TABLE lab_tests_available (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES test(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    collection collection_method NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

    UNIQUE (lab_id, test_id) -- optional, ensures no duplicate pair
);