import { Lbool } from './Lbool.ts';
import { Watcher } from './Watcher.ts';
import { Clause } from './Clause.ts';
import { Lit } from './Lit.ts';
import { VarData } from './VarData.ts';
import { VecLbool } from './VecLbool.ts';
import { VecLit } from './VecLit.ts';
import { Vec } from '../mtl/Vec.ts';
import { VecNumber } from '../mtl/VecNumber.ts';
import { OccLists } from './OccLists.ts';
import { VecBool } from '../mtl/VecBool.ts';
import { HeapVarOrderLt } from './HeapVarOrderLt.ts';
import { VarOrderLt } from './VarOrderLt.ts';
import { Var } from './Var.ts';
import { ClauseAllocator } from './ClauseAllocator.ts';
import { VecVar } from './VecVar.ts';

export class Solver {
  public static printf(format: string, ...args: any[]): void {
    console.log(format, ...args);
  }

  public model = new VecLbool();
  public conflict = new VecLit();
  public verbosity: number;
  public var_decay: number;
  public clause_decay: number;
  public random_var_freq: number;
  public random_seed: number;
  public luby_restart: boolean;
  public ccmin_mode: number;
  public phase_saving: number;
  public rnd_pol: boolean;
  public rnd_init_act: boolean;
  public garbage_frac: number;
  public restart_first: number;
  public restart_inc: number;
  public learntsize_factor: number;
  public learntsize_inc: number;
  public learntsize_adjust_start_confl: number;
  public learntsize_adjust_inc: number;
  public solves!: number;
  public starts!: number;
  public decisions!: number;
  public rnd_decisions!: number;
  public propagations!: number;
  public conflicts!: number;
  public dec_vars!: number;
  public clauses_literals!: number;
  public learnts_literals!: number;
  public max_literals!: number;
  public tot_literals!: number;
  protected _ok: boolean;
  protected _clauses = new Vec<Clause>();

  public clauses(): Vec<Clause> {
    return this._clauses;
  }

  protected _learnts = new Vec<Clause>();
  protected _cla_inc: number;
  protected _activity = new VecNumber();
  protected _var_inc: number;
  protected _watches: OccLists;
  protected _assigns = new VecLbool();
  protected _polarity = new VecBool();
  protected _decision = new VecBool();
  protected _trail = new VecLit();
  protected _trail_lim = new VecNumber();
  protected _vardata = new Vec<VarData>();
  protected _qhead: number;
  protected _simpDB_assigns: number;
  protected _simpDB_props: number;
  protected _assumptions = new VecLit();
  protected _order_heap: HeapVarOrderLt;
  protected _progress_estimate: number;
  protected _remove_satisfied: boolean;
  protected _seen = new VecBool();
  protected _analyze_stack = new VecLit();
  protected _analyze_toclear = new VecLit();
  protected _add_tmp = new VecLit();
  protected _max_learnts!: number;
  protected _learntsize_adjust_confl!: number;
  protected _learntsize_adjust_cnt!: number;
  protected _conflict_budget: number;
  protected _propagation_budget: number;
  protected _asynch_interrupt: boolean;

  protected drand(): number {
    this.random_seed *= 1389796;
    const q = Math.floor(this.random_seed / 2147483647);
    this.random_seed -= q * 2147483647;
    return this.random_seed / 2147483647;
  }

  protected irand(size: number): number {
    return Math.floor(this.drand() * size);
  }

  public reason(x: Var): Clause {
    return this._vardata.get(x.value()).reason;
  }

  public level(x: number): number {
    return this._vardata.get(x).level;
  }

  protected insertVarOrder(x: Var): void {
    if (!this._order_heap.inHeap(x.value()) && this._decision.get(x.value())) {
      this._order_heap.insert(x.value());
    }
  }

  protected varDecayActivity(): void {
    this._var_inc *= 1 / this.var_decay;
  }

  protected varBumpActivity(v: Var, inc?: number): void {
    if (inc === undefined) {
      this.varBumpActivity(v, this._var_inc);
    } else {
      const i = v.value();
      if (this._activity.set(i, this._activity.get(i) + inc) > 1e100) {
        for (let j = 0; j < this.nVars(); j++) {
          this._activity.set(j, this._activity.get(j) * 1e-100);
        }
        this._var_inc *= 1e-100;
      }
      if (this._order_heap.inHeap(i)) {
        this._order_heap.decrease(i);
      }
    }
  }

  protected claDecayActivity(): void {
    this._cla_inc *= 1 / this.clause_decay;
  }

  protected claBumpActivity(c: Clause): void {
    c.activity = c.activity + this._cla_inc;
    if (c.activity > 1e20) {
      for (let i = 0; i < this._learnts.size(); i++) {
        const cl = this._learnts.get(i);
        cl.activity = cl.activity * 1e-20;
      }
      this._cla_inc *= 1e-20;
    }
  }

  protected checkGarbage(): void {}

  public enqueue(p: Lit, from: Clause): boolean {
    if (this.valueLit(p) !== Lbool.UNDEF) {
      return this.valueLit(p) !== Lbool.FALSE;
    } else {
      this.uncheckedEnqueue(p, from);
      return true;
    }
  }

  public addClause(ps: VecLit): boolean {
    return this.addClause_(ps);
  }

  protected locked(c: Clause): boolean {
    const rc = this.reason(Var.valueOf(c.get(0).var()));
    return this.valueLit(c.get(0)) === Lbool.TRUE && rc !== Clause.CRef_Undef && rc.equals(c);
  }

  protected newDecisionLevel(): void {
    this._trail_lim.push(this._trail.size());
  }

  protected decisionLevel(): number {
    return this._trail_lim.size();
  }

  protected abstractLevel(x: number): number {
    return 1 << (this.level(x) & 31);
  }

  protected valueVar(x: Var): Lbool {
    return this._assigns.get(x.value());
  }

  protected valueLit(p: Lit): Lbool {
    return Lbool.xor(this._assigns.get(p.var()), p.sign());
  }

  protected modelValueVar(x: Var): Lbool {
    return this.model.get(x.value());
  }

  protected modelValueLit(p: Lit): Lbool {
    return Lbool.xor(this.model.get(p.var()), p.sign());
  }

  protected nAssigns(): number {
    return this._trail.size();
  }

  public nClauses(): number {
    return this._clauses.size();
  }

  protected nLearnts(): number {
    return this._learnts.size();
  }

  public nVars(): number {
    return this._vardata.size();
  }

  protected nFreeVars(): number {
    return this.dec_vars - (this._trail_lim.size() === 0 ? this._trail.size() : this._trail_lim.get(0));
  }

  protected setPolarity(v: Var, b: boolean): void {
    this._polarity.set(v.value(), b);
  }

  protected setDecisionVar(v: Var, b: boolean): void {
    const i = v.value();
    if (b && !this._decision.get(i)) {
      this.dec_vars++;
    } else if (!b && this._decision.get(i)) {
      this.dec_vars--;
    }
    this._decision.set(i, b);
    this.insertVarOrder(v);
  }

  protected setConfBudget(x: number): void {
    this._conflict_budget = this.conflicts + x;
  }

  protected setPropBudget(x: number): void {
    this._propagation_budget = this.propagations + x;
  }

  protected interrupt(): void {
    this._asynch_interrupt = true;
  }

  protected clearInterrupt(): void {
    this._asynch_interrupt = false;
  }

  protected budgetOff(): void {
    this._conflict_budget = this._propagation_budget = -1;
  }

  protected withinBudget(): boolean {
    return (
      !this._asynch_interrupt &&
      (this._conflict_budget < 0 || this.conflicts < this._conflict_budget) &&
      (this._propagation_budget < 0 || this.propagations < this._propagation_budget)
    );
  }

  public solve(): boolean {
    this.budgetOff();
    this._assumptions.clear();
    return this.solve_() === Lbool.TRUE;
  }

  protected solve1(p: Lit): boolean {
    this.budgetOff();
    this._assumptions.clear();
    this._assumptions.push(p);
    return this.solve_() === Lbool.TRUE;
  }

  protected solve2(p: Lit, q: Lit): boolean {
    this.budgetOff();
    this._assumptions.clear();
    this._assumptions.push(p);
    this._assumptions.push(q);
    return this.solve_() === Lbool.TRUE;
  }

  protected solve3(p: Lit, q: Lit, r: Lit): boolean {
    this.budgetOff();
    this._assumptions.clear();
    this._assumptions.push(p);
    this._assumptions.push(q);
    this._assumptions.push(r);
    return this.solve_() === Lbool.TRUE;
  }

  protected solveWithAssumptions(assumps: VecLit): boolean {
    this.budgetOff();
    assumps.copyTo(this._assumptions);
    return this.solve_() === Lbool.TRUE;
  }

  protected solveLimited(assumps: VecLit): Lbool {
    assumps.copyTo(this._assumptions);
    return this.solve_();
  }

  protected okay(): boolean {
    return this._ok;
  }

  public constructor() {
    this.verbosity = Solver.VERBOSITY_DEFAULT;
    this.var_decay = Solver.VAR_DECAY_DEFAULT;
    this.clause_decay = Solver.CLAUSE_DECAY_DEFAULT;
    this.random_var_freq = Solver.RANDOM_VAR_FREQ_DEFAULT;
    this.random_seed = Solver.RANDOM_SEED_DEFAULT;
    this.luby_restart = Solver.LUBY_RESTART_DEFAULT;
    this.ccmin_mode = Solver.CCMIN_MODE_DEFAULT;
    this.phase_saving = Solver.PHASE_SAVING_DEFAULT;
    this.rnd_pol = false;
    this.rnd_init_act = Solver.RND_INIT_ACT_DEFAULT;
    this.garbage_frac = Solver.GARBAGE_FRAC_DEFAULT;
    this.restart_first = Solver.RESTART_FIRST_DEFAULT;
    this.restart_inc = Solver.RESTART_INC_DEFAULT;
    this.learntsize_factor = 1 / 3;
    this.learntsize_inc = 1.1;
    this.learntsize_adjust_start_confl = 100;
    this.learntsize_adjust_inc = 1.5;
    this._ok = true;
    this._cla_inc = 1;
    this._var_inc = 1;
    this._watches = new OccLists();
    this._qhead = 0;
    this._simpDB_assigns = -1;
    this._simpDB_props = 0;
    this._order_heap = new HeapVarOrderLt(new VarOrderLt(this._activity));
    this._progress_estimate = 0;
    this._remove_satisfied = true;
    this._conflict_budget = -1;
    this._propagation_budget = -1;
    this._asynch_interrupt = false;
  }

  public newVar(sign?: boolean, dvar?: boolean): Var {
    if (sign === undefined) {
      return this.newVar(true, true);
    } else if (dvar === undefined) {
      return this.newVar(sign, true);
    } else {
      const v = this.nVars();
      const vv = Var.valueOf(v);
      this._watches.init(Lit.valueOfVar(v, false));
      this._watches.init(Lit.valueOfVar(v, true));
      this._assigns.push(Lbool.UNDEF);
      this._vardata.push(VarData.mkVarData(Clause.CRef_Undef, 0));
      this._activity.push(this.rnd_init_act ? this.drand() * 0.00001 : 0.0);
      this._seen.push(false);
      this._polarity.push(sign);
      this._decision.push(false);
      this._trail.capacity = v + 1;
      this.setDecisionVar(vv, dvar);
      return vv;
    }
  }

  public addEmptyClause(): boolean {
    this._add_tmp.clear();
    return this.addClause_(this._add_tmp);
  }

  public addClause1(p: Lit): boolean {
    this._add_tmp.clear();
    this._add_tmp.push(p);
    return this.addClause_(this._add_tmp);
  }

  public addClause2(p: Lit, q: Lit): boolean {
    this._add_tmp.clear();
    this._add_tmp.push(p);
    this._add_tmp.push(q);
    return this.addClause_(this._add_tmp);
  }

  public addClause3(p: Lit, q: Lit, r: Lit): boolean {
    this._add_tmp.clear();
    this._add_tmp.push(p);
    this._add_tmp.push(q);
    this._add_tmp.push(r);
    return this.addClause_(this._add_tmp);
  }

  public addClauseFromArray(vars: number[]): boolean {
    this._add_tmp.clear();
    for (const variable of vars) {
      if (variable === 0) {
        throw new Error('all vars must not be zero');
      }
      this._add_tmp.push(Lit.valueOfVar(Math.abs(variable) - 1, variable < 0));
    }
    return this.addClause_(this._add_tmp);
  }

  protected addClause_(ps: VecLit): boolean {
    if (this.decisionLevel() !== 0) {
      throw new Error(`decisionLevel() = ${this.decisionLevel()}`);
    }
    if (!this._ok) {
      return false;
    }

    ps.sort();
    let p: Lit;
    let i: number, j: number;
    for (i = j = 0, p = Lit.UNDEF; i < ps.size(); i++) {
      const v = ps.get(i).var();
      while (v >= this.nVars()) {
        this.newVar();
      }
      if (this.valueLit(ps.get(i)) === Lbool.TRUE || ps.get(i).equals(p.not())) {
        return true;
      } else if (this.valueLit(ps.get(i)) !== Lbool.FALSE && !ps.get(i).equals(p)) {
        ps.set(j++, (p = ps.get(i)));
      }
    }
    ps.shrink(i - j);

    if (ps.size() === 0) {
      return (this._ok = false);
    } else if (ps.size() === 1) {
      this.uncheckedEnqueueSimple(ps.get(0));
      return (this._ok = this.propagate() === Clause.CRef_Undef);
    } else {
      const cr = new Clause(ps, false, false);
      this._clauses.push(cr);
      this.attachClause(cr);
    }

    return true;
  }

  protected attachClause(cr: Clause): void {
    if (cr.size() <= 1) {
      throw new Error('cr');
    }
    this._watches.get(cr.get(0).not()).push(new Watcher(cr, cr.get(1)));
    this._watches.get(cr.get(1).not()).push(new Watcher(cr, cr.get(0)));
    if (cr.learnt()) {
      this.learnts_literals += cr.size();
    } else {
      this.clauses_literals += cr.size();
    }
  }

  protected detachClause(cr: Clause, strict: boolean): void {
    if (cr.size() <= 1) {
      throw new Error('cr');
    }
    if (strict) {
      this._watches.get(cr.get(0).not()).remove(new Watcher(cr, cr.get(1)));
      this._watches.get(cr.get(1).not()).remove(new Watcher(cr, cr.get(0)));
    } else {
      this._watches.smudge(cr.get(0).not());
      this._watches.smudge(cr.get(1).not());
    }

    if (cr.learnt()) {
      this.learnts_literals -= cr.size();
    } else {
      this.clauses_literals -= cr.size();
    }
  }

  protected detachClauseSimple(cr: Clause): void {
    this.detachClause(cr, false);
  }

  protected removeClause(cr: Clause): void {
    this.detachClauseSimple(cr);
    if (this.locked(cr)) {
      this._vardata.get(cr.get(0).var()).reason = Clause.CRef_Undef;
    }
    cr.mark(1);
  }

  protected satisfied(c: Clause): boolean {
    for (let i = 0; i < c.size(); i++) {
      if (this.valueLit(c.get(i)) === Lbool.TRUE) {
        return true;
      }
    }
    return false;
  }

  protected cancelUntil(level: number): void {
    if (this.decisionLevel() > level) {
      for (let c = this._trail.size() - 1; c >= this._trail_lim.get(level); c--) {
        const x = this._trail.get(c).var();
        this._assigns.set(x, Lbool.UNDEF);
        if (this.phase_saving > 1 || (this.phase_saving === 1 && c > this._trail_lim.last())) {
          this._polarity.set(x, this._trail.get(c).sign());
        }
        this.insertVarOrder(Var.valueOf(x));
      }
      this._qhead = this._trail_lim.get(level);
      this._trail.shrink(this._trail.size() - this._trail_lim.get(level));
      this._trail_lim.shrink(this._trail_lim.size() - level);
    }
  }

  protected pickBranchLit(): Lit {
    let next = Var.UNDEF;

    if (this.drand() < this.random_var_freq && !this._order_heap.empty()) {
      next = Var.valueOf(this._order_heap.get(this.irand(this._order_heap.size())));
      if (this.valueVar(next) === Lbool.UNDEF && this._decision.get(next.value())) {
        this.rnd_decisions++;
      }
    }
    while (next.equals(Var.UNDEF) || this.valueVar(next) !== Lbool.UNDEF || !this._decision.get(next.value())) {
      if (this._order_heap.empty()) {
        next = Var.UNDEF;
        break;
      } else {
        next = Var.valueOf(this._order_heap.removeMin());
      }
    }

    return next.equals(Var.UNDEF) ?
        Lit.UNDEF
      : Lit.valueOfVar(next.value(), this.rnd_pol ? this.drand() < 0.5 : this._polarity.get(next.value()));
  }

  protected analyze(confl: Clause, out_learnt: VecLit, out_btlevel: number): number {
    let pathC = 0;
    let p: Lit = Lit.UNDEF;

    out_learnt.push(Lit.UNDEF);
    let index = this._trail.size() - 1;

    do {
      const c = confl;

      if (c.learnt()) {
        this.claBumpActivity(c);
      }

      for (let j = p.equals(Lit.UNDEF) ? 0 : 1; j < c.size(); j++) {
        const q = c.get(j);

        if (!this._seen.get(q.var()) && this.level(q.var()) > 0) {
          this.varBumpActivity(Var.valueOf(q.var()));
          this._seen.set(q.var(), true);
          if (this.level(q.var()) >= this.decisionLevel()) {
            pathC++;
          } else {
            out_learnt.push(q);
          }
        }
      }

      while (!this._seen.get(this._trail.get(index--).var())) {}
      p = this._trail.get(index + 1);
      confl = this.reason(Var.valueOf(p.var()));
      this._seen.set(p.var(), false);
      pathC--;
    } while (pathC > 0);
    out_learnt.set(0, p.not());

    let i: number, j: number;
    out_learnt.copyTo(this._analyze_toclear);
    if (this.ccmin_mode === 2) {
      let abstract_level = 0;
      for (i = 1; i < out_learnt.size(); i++) {
        abstract_level |= this.abstractLevel(out_learnt.get(i).var());
      }

      for (i = j = 1; i < out_learnt.size(); i++) {
        if (
          this.reason(Var.valueOf(out_learnt.get(i).var())) === Clause.CRef_Undef ||
          !this.litRedundant(out_learnt.get(i), abstract_level)
        ) {
          out_learnt.set(j++, out_learnt.get(i));
        }
      }
    } else if (this.ccmin_mode === 1) {
      for (i = j = 1; i < out_learnt.size(); i++) {
        const x = Var.valueOf(out_learnt.get(i).var());

        if (this.reason(x) === Clause.CRef_Undef) {
          out_learnt.set(j++, out_learnt.get(i));
        } else {
          const c = this.reason(Var.valueOf(out_learnt.get(i).var()));
          for (let k = 1; k < c.size(); k++) {
            if (!this._seen.get(c.get(k).var()) && this.level(c.get(k).var()) > 0) {
              out_learnt.set(j++, out_learnt.get(i));
              break;
            }
          }
        }
      }
    } else {
      i = j = out_learnt.size();
    }

    this.max_literals += out_learnt.size();
    out_learnt.shrink(i - j);
    this.tot_literals += out_learnt.size();

    if (out_learnt.size() === 1) {
      out_btlevel = 0;
    } else {
      let max_i = 1;
      for (let k = 2; k < out_learnt.size(); k++) {
        if (this.level(out_learnt.get(k).var()) > this.level(out_learnt.get(max_i).var())) {
          max_i = k;
        }
      }
      const pp = out_learnt.get(max_i);
      out_learnt.set(max_i, out_learnt.get(1));
      out_learnt.set(1, pp);
      out_btlevel = this.level(pp.var());
    }

    for (let k = 0; k < this._analyze_toclear.size(); k++) {
      this._seen.set(this._analyze_toclear.get(k).var(), false);
    }
    return out_btlevel;
  }

  protected litRedundant(p: Lit, abstract_levels: number): boolean {
    this._analyze_stack.clear();
    this._analyze_stack.push(p);
    const top = this._analyze_toclear.size();
    while (this._analyze_stack.size() > 0) {
      const c = this.reason(Var.valueOf(this._analyze_stack.last().var()));
      this._analyze_stack.pop();

      for (let i = 1; i < c.size(); i++) {
        const pp = c.get(i);
        if (!this._seen.get(pp.var()) && this.level(pp.var()) > 0) {
          if (
            this.reason(Var.valueOf(pp.var())) !== Clause.CRef_Undef &&
            (this.abstractLevel(pp.var()) & abstract_levels) !== 0
          ) {
            this._seen.set(pp.var(), true);
            this._analyze_stack.push(pp);
            this._analyze_toclear.push(pp);
          } else {
            for (let j = top; j < this._analyze_toclear.size(); j++) {
              this._seen.set(this._analyze_toclear.get(j).var(), false);
            }
            this._analyze_toclear.shrink(this._analyze_toclear.size() - top);
            return false;
          }
        }
      }
    }

    return true;
  }

  protected analyzeFinal(p: Lit, out_conflict: VecLit): void {
    out_conflict.clear();
    out_conflict.push(p);

    if (this.decisionLevel() === 0) {
      return;
    }

    this._seen.set(p.var(), true);

    for (let i = this._trail.size() - 1; i >= this._trail_lim.get(0); i--) {
      const x = Var.valueOf(this._trail.get(i).var());
      if (this._seen.get(x.value())) {
        if (this.reason(x) === Clause.CRef_Undef) {
          if (this.level(x.value()) > 0) {
            out_conflict.push(this._trail.get(i).not());
          }
        } else {
          const c = this.reason(x);
          for (let j = 1; j < c.size(); j++) {
            if (this.level(c.get(j).var()) > 0) {
              this._seen.set(c.get(j).var(), true);
            }
          }
        }
        this._seen.set(x.value(), false);
      }
    }

    this._seen.set(p.var(), false);
  }

  protected uncheckedEnqueue(p: Lit, from: Clause): void {
    if (this.valueLit(p) !== Lbool.UNDEF) {
      throw new Error('p');
    }
    this._assigns.set(p.var(), Lbool.valueOf(!p.sign() ? 1 : 0));
    this._vardata.set(p.var(), VarData.mkVarData(from, this.decisionLevel()));
    this._trail.push_(p);
  }

  protected uncheckedEnqueueSimple(p: Lit): void {
    this.uncheckedEnqueue(p, Clause.CRef_Undef);
  }

  protected propagate(): Clause {
    let confl = Clause.CRef_Undef;
    let num_props = 0;
    this._watches.cleanAll();

    while (this._qhead < this._trail.size()) {
      const p = this._trail.get(this._qhead++);
      const ws = this._watches.get(p);
      num_props++;

      let i = 0,
        j = 0,
        size = ws.size();
      while (i < size) {
        const blocker = ws.get(i).blocker;
        if (this.valueLit(blocker) === Lbool.TRUE) {
          ws.set(j++, ws.get(i++));
          continue;
        }

        const c = ws.get(i).cref;
        const false_lit = p.not();
        if (c.get(0).equals(false_lit)) {
          c.set(0, c.get(1));
          c.set(1, false_lit);
        }
        i++;

        const first = c.get(0);
        const w = new Watcher(c, first);
        if (!first.equals(blocker) && this.valueLit(first) === Lbool.TRUE) {
          ws.set(j++, w);
          continue;
        }

        for (let k = 2; k < c.size(); k++) {
          const ck = c.get(k);
          if (this.valueLit(ck) !== Lbool.FALSE) {
            c.set(1, ck);
            c.set(k, false_lit);
            this._watches.get(c.get(1).not()).push(w);
            break;
          }
        }

        ws.set(j++, w);
        if (this.valueLit(first) === Lbool.FALSE) {
          confl = c;
          this._qhead = this._trail.size();
          while (i < size) {
            ws.set(j++, ws.get(i++));
          }
        } else {
          this.uncheckedEnqueue(first, c);
        }
      }
      ws.shrink(i - j);
    }
    this.propagations += num_props;
    this._simpDB_props -= num_props;

    return confl;
  }

  protected reduceDB(): void {
    let i: number, j: number;
    const extra_lim = this._cla_inc / this._learnts.size();

    this._learnts.sort((x, y) => {
      if (x.size() > 2 && (y.size() === 2 || x.activity < y.activity)) {
        return -1;
      } else if (y.size() > 2 && (x.size() === 2 || y.activity < x.activity)) {
        return 1;
      } else {
        return 0;
      }
    });

    for (i = j = 0; i < this._learnts.size(); i++) {
      const c = this._learnts.get(i);
      if (c.size() > 2 && !this.locked(c) && (i < this._learnts.size() / 2 || c.activity < extra_lim)) {
        this.removeClause(this._learnts.get(i));
      } else {
        this._learnts.set(j++, this._learnts.get(i));
      }
    }
    this._learnts.shrink(i - j);
    this.checkGarbage();
  }

  protected removeSatisfied(cs: Vec<Clause>): void {
    let i: number, j: number;
    for (i = j = 0; i < cs.size(); i++) {
      const c = cs.get(i);
      if (this.satisfied(c)) {
        this.removeClause(cs.get(i));
      } else {
        cs.set(j++, cs.get(i));
      }
    }
    cs.shrink(i - j);
  }

  protected rebuildOrderHeap(): void {
    const vs = new VecNumber();
    for (let v = 0; v < this.nVars(); v++) {
      if (this._decision.get(v) && this.valueVar(Var.valueOf(v)) === Lbool.UNDEF) {
        vs.push(v);
      }
    }
    this._order_heap.build(vs);
  }

  protected simplify(): boolean {
    if (this.decisionLevel() !== 0) {
      throw new Error('decisionLevel() != 0');
    }
    if (!this._ok || this.propagate() !== Clause.CRef_Undef) {
      return (this._ok = false);
    }

    if (this.nAssigns() === this._simpDB_assigns || this._simpDB_props > 0) {
      return true;
    }

    this.removeSatisfied(this._learnts);
    if (this._remove_satisfied) {
      this.removeSatisfied(this._clauses);
    }
    this.checkGarbage();
    this.rebuildOrderHeap();

    this._simpDB_assigns = this.nAssigns();
    this._simpDB_props = this.clauses_literals + this.learnts_literals;

    return true;
  }

  protected search(nof_conflicts: number): Lbool {
    if (!this._ok) {
      throw new Error('!ok');
    }
    let backtrack_level = 0;
    let conflictC = 0;
    const learnt_clause = new VecLit();
    this.starts++;

    for (;;) {
      const confl = this.propagate();
      if (confl !== Clause.CRef_Undef) {
        this.conflicts++;
        conflictC++;
        if (this.decisionLevel() === 0) {
          return Lbool.FALSE;
        }

        learnt_clause.clear();
        backtrack_level = this.analyze(confl, learnt_clause, backtrack_level);
        this.cancelUntil(backtrack_level);

        if (learnt_clause.size() === 1) {
          this.uncheckedEnqueueSimple(learnt_clause.get(0));
        } else {
          const cr = new Clause(learnt_clause, true, true);
          this._learnts.push(cr);
          this.attachClause(cr);
          this.claBumpActivity(cr);
          this.uncheckedEnqueue(learnt_clause.get(0), cr);
        }

        this.varDecayActivity();
        this.claDecayActivity();

        if (--this._learntsize_adjust_cnt === 0) {
          this._learntsize_adjust_confl *= this.learntsize_adjust_inc;
          this._learntsize_adjust_cnt = this._learntsize_adjust_confl;
          this._max_learnts *= this.learntsize_inc;

          if (this.verbosity >= 1) {
            Solver.printf(
              '| %9d | %7d %8d %8d | %8d %8d %6.0f | %6.3f %% |',
              this.conflicts,
              this.dec_vars - (this._trail_lim.size() === 0 ? this._trail.size() : this._trail_lim.get(0)),
              this.nClauses(),
              this.clauses_literals,
              this._max_learnts,
              this.nLearnts(),
              this.learnts_literals / this.nLearnts(),
              this.progressEstimate() * 100,
            );
          }
        }
      } else {
        if ((nof_conflicts >= 0 && conflictC >= nof_conflicts) || !this.withinBudget()) {
          this._progress_estimate = this.progressEstimate();
          this.cancelUntil(0);
          return Lbool.UNDEF;
        }

        if (this.decisionLevel() === 0 && !this.simplify()) {
          return Lbool.FALSE;
        }

        if (this._learnts.size() - this.nAssigns() >= this._max_learnts) {
          this.reduceDB();
        }

        let next = Lit.UNDEF;
        while (this.decisionLevel() < this._assumptions.size()) {
          const p = this._assumptions.get(this.decisionLevel());
          if (this.valueLit(p) === Lbool.TRUE) {
            this.newDecisionLevel();
          } else if (this.valueLit(p) === Lbool.FALSE) {
            this.analyzeFinal(p.not(), this.conflict);
            return Lbool.FALSE;
          } else {
            next = p;
            break;
          }
        }

        if (next.equals(Lit.UNDEF)) {
          this.decisions++;
          next = this.pickBranchLit();

          if (next.equals(Lit.UNDEF)) {
            return Lbool.TRUE;
          }
        }

        this.newDecisionLevel();
        this.uncheckedEnqueueSimple(next);
      }
    }
  }

  protected progressEstimate(): number {
    let progress = 0;
    const F = 1.0 / this.nVars();

    for (let i = 0; i <= this.decisionLevel(); i++) {
      const beg = i === 0 ? 0 : this._trail_lim.get(i - 1);
      const end = i === this.decisionLevel() ? this._trail.size() : this._trail_lim.get(i);
      progress += Math.pow(F, i) * (end - beg);
    }

    return progress / this.nVars();
  }

  protected static luby(y: number, x: number): number {
    let size, seq;
    for (size = 1, seq = 0; size < x + 1; seq++, size = 2 * size + 1) {}

    while (size - 1 !== x) {
      size = (size - 1) >> 1;
      seq--;
      x = x % size;
    }

    return Math.pow(y, seq);
  }

  protected solve_(): Lbool {
    this.model.clear();
    this.conflict.clear();
    if (!this._ok) {
      return Lbool.FALSE;
    }

    this.solves++;

    this._max_learnts = this.nClauses() * this.learntsize_factor;
    this._learntsize_adjust_confl = this.learntsize_adjust_start_confl;
    this._learntsize_adjust_cnt = this._learntsize_adjust_confl;
    let status: Lbool = Lbool.UNDEF;

    if (this.verbosity >= 1) {
      Solver.printf('============================[ Search Statistics ]==============================');
      Solver.printf('| Conflicts |          ORIGINAL         |          LEARNT          | Progress |');
      Solver.printf('|           |    Vars  Clauses Literals |    Limit  Clauses Lit/Cl |          |');
      Solver.printf('===============================================================================');
    }

    let curr_restarts = 0;
    while (status === Lbool.UNDEF) {
      const rest_base =
        this.luby_restart ? Solver.luby(this.restart_inc, curr_restarts) : Math.pow(this.restart_inc, curr_restarts);
      status = this.search(rest_base * this.restart_first);
      if (!this.withinBudget()) {
        break;
      }
      curr_restarts++;
    }

    if (this.verbosity >= 1) {
      Solver.printf('===============================================================================');
    }

    if (status === Lbool.TRUE) {
      this.model.growTo(this.nVars());
      for (let i = 0; i < this.nVars(); i++) {
        this.model.set(i, this.valueVar(Var.valueOf(i)));
      }
    } else if (status === Lbool.FALSE && this.conflict.size() === 0) {
      this._ok = false;
    }

    this.cancelUntil(0);
    return status;
  }

  protected static mapVar(x: number, map: VecVar, max: number[]): Var {
    if (map.size() <= x || map.get(x) === Var.UNDEF) {
      map.growTo(x + 1, Var.UNDEF);
      map.set(x, Var.valueOf(max[0]++));
    }
    return map.get(x);
  }

  protected realocAll(to: ClauseAllocator): void {}

  protected garbageCollect(): void {}

  public static readonly VERBOSITY_DEFAULT = 0;
  public static readonly VAR_DECAY_DEFAULT = 0.95;
  public static readonly CLAUSE_DECAY_DEFAULT = 0.999;
  public static readonly RANDOM_VAR_FREQ_DEFAULT = 0;
  public static readonly RANDOM_SEED_DEFAULT = 91648253;
  public static readonly CCMIN_MODE_DEFAULT = 2;
  public static readonly PHASE_SAVING_DEFAULT = 2;
  public static readonly RND_INIT_ACT_DEFAULT = false;
  public static readonly LUBY_RESTART_DEFAULT = true;
  public static readonly RESTART_FIRST_DEFAULT = 100;
  public static readonly RESTART_INC_DEFAULT = 2;
  public static readonly GARBAGE_FRAC_DEFAULT = 0.2;

  public static parse_DIMACS_main(input: string, S: Solver): void {
    const lines = input.split('\n');
    let vars = 0;
    let clauses = 0;
    let cnt = 0;
    const lits = new VecLit();

    for (const line of lines) {
      const tokens = line.trim().split(/\s+/);
      if (tokens.length === 0) {
        continue;
      }

      let token = tokens.shift();
      if (token === undefined) {
        continue;
      }

      if (token === 'c') {
        // Skip the comment line
        continue;
      } else if (token === 'p') {
        token = tokens.shift();
        if (token !== 'cnf') {
          throw new Error("PARSE ERROR! 'cnf' expected after 'p'");
        }
        vars = parseInt(tokens.shift()!, 10);
        clauses = parseInt(tokens.shift()!, 10);
      } else {
        ++cnt;
        lits.clear();
        while (true) {
          const parsed_lit = parseInt(token, 10);
          if (parsed_lit === 0) {
            break;
          }
          const variable = Math.abs(parsed_lit) - 1;
          while (variable >= S.nVars()) {
            S.newVar();
          }
          lits.push(Lit.valueOfVar(variable, parsed_lit < 0));
          token = tokens.shift();
          if (token === undefined) {
            break;
          }
        }
        S.addClause_(lits);
      }
    }

    if (vars !== S.nVars()) {
      throw new Error('WARNING! DIMACS header mismatch: wrong number of variables.');
    }
    if (cnt !== clauses) {
      throw new Error('WARNING! DIMACS header mismatch: wrong number of clauses.');
    }
  }
}
