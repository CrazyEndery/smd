import networkx as nx
from typing import List, Dict, Any

# def build_graph(entities):
#     G = nx.MultiDiGraph()
#     for e in entities:
#         node_id = e["text"].lower()
#         G.add_node(node_id, label=e["label"])  # сущность с ярлыком

#         # Добавьте контекст, если узел еще не существует:
#         context_id = e["sentence"][:32]
#         if context_id not in G.nodes:
#             G.add_node(context_id, label="context")
#         G.add_edge(context_id, node_id, relation="mentions")
#     return G


def build_graph(entities, relations):
    G = nx.DiGraph()
    for ent in entities:
        G.add_node(ent['word'], type=ent['entity_group'], conf=ent.get('score', 1.0))
    for rel in relations:
        G.add_edge(rel['head'], rel['tail'], relation=rel['relation'], conf=rel['conf'])
    return G

def to_json(G):
    nodes = [{"id": n, "label": d.get("label", "unknown")} for n, d in G.nodes(data=True)]
    edges = [
        {"source": u, "target": v, "relation": d["relation"]}
        for u, v, d in G.edges(data=True)
    ]
    return {"nodes": nodes, "edges": edges}
