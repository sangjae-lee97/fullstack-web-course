
# Chapter 07 - SQL Queries

INSERT_MEMBER_SQL = """
INSERT INTO practice.members (name, email, age)
VALUES (%s, %s, %s)
RETURNING member_id, name, email, age
"""
